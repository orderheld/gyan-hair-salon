import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { getSql, type Row } from "./db";
import { toDateKey, zurichToDate } from "./time";

/**
 * Stempelkarte.
 * - Eine Karte pro Kunde (E-Mail, kleingeschrieben, wie customerKey()), mit geheimem Token für den QR-Code
 *   und einem kurzen Empfehlungscode.
 * - Jede Buchung auf der Karte ist ein Eintrag in loyalty_stamps, der nie geändert wird.
 *   Der Stand ist die Summe aller Einträge. Fehler werden mit einem Korrektur-Eintrag (mit Grund) behoben.
 * - Jeder Eintrag bekommt pro Karte die nächste Nummer (seq). Der Scanner schickt die Nummer mit, die er gesehen hat:
 *   doppeltes Tippen oder zwei Geräte gleichzeitig ergeben so nie einen doppelten Stempel.
 * - Stempel gibt es nur über das Admin (Scan oder Suche), nie automatisch aus Buchungen.
 */

export type LoyaltySettings = {
  /** so viele Stempel füllen die Karte; der nächste Haarschnitt ist gratis */
  stampsNeeded: number;
  birthdayEnabled: boolean;
  /** Geburtstagsgruss per E-Mail/Push (nur mit Werbe-Einwilligung) */
  birthdayNotify: boolean;
  referralEnabled: boolean;
  /** einmaliger Stempel für eine Google-Bewertung (vom Inhaber gewünscht, auf eigenes Risiko) */
  reviewEnabled: boolean;
};

export const DEFAULT_LOYALTY: LoyaltySettings = {
  stampsNeeded: 11,
  birthdayEnabled: true,
  birthdayNotify: true,
  referralEnabled: true,
  reviewEnabled: true,
};

/** Warnung, wenn dieselbe Karte innerhalb dieser Zeit schon einen Besuchsstempel bekam */
export const RECENT_VISIT_HOURS = 2;

/** Admin: zuletzt gewählte Person bei «Wer stempelt?» */
export const STAFF_COOKIE = "gyan_stempel_wer";

export type StampKind = "visit" | "referral" | "review" | "birthday" | "redeem" | "correction";

export async function getLoyaltySettings(): Promise<LoyaltySettings & { loyaltyPublic: boolean }> {
  const sql = await getSql();
  const rows = await sql`SELECT key, value FROM settings WHERE key IN ('loyalty', 'loyaltyPublic')`;
  const stored = (rows.find((r) => r.key === "loyalty")?.value ?? {}) as Partial<LoyaltySettings>;
  const s = { ...DEFAULT_LOYALTY, ...stored };
  s.stampsNeeded = Math.min(30, Math.max(2, Math.round(Number(s.stampsNeeded) || DEFAULT_LOYALTY.stampsNeeded)));
  return { ...s, loyaltyPublic: rows.find((r) => r.key === "loyaltyPublic")?.value === true };
}

export async function saveLoyaltySettings(s: LoyaltySettings, loyaltyPublic: boolean) {
  const sql = await getSql();
  for (const [key, value] of [["loyalty", s], ["loyaltyPublic", loyaltyPublic]] as const) {
    await sql`INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
              ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  }
}

/** Ist die Stempelkarte für Kunden sichtbar? (Solange nicht: Seite «kommt bald», Kunden-API 404) */
export async function isLoyaltyPublic() {
  return (await getLoyaltySettings()).loyaltyPublic;
}

/* ---------- Karten ---------- */

export type Card = { id: number; customerKey: string; token: string; refCode: string; name: string; birthDate: string; createdAt: Date };

const mapCard = (r: Row): Card => ({
  id: Number(r.id),
  customerKey: String(r.customer_key),
  token: String(r.token),
  refCode: String(r.ref_code),
  name: String(r.name ?? ""),
  birthDate: String(r.birth_date ?? ""),
  createdAt: r.created_at instanceof Date ? r.created_at : new Date(String(r.created_at)),
});

const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // ohne 0/O, 1/I/L
export const newToken = () => randomBytes(16).toString("base64url"); // 22 Zeichen, nicht erratbar
export const newRefCode = () => Array.from({ length: 7 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join("");
export const normalizeRefCode = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

export async function getCardByToken(token: string): Promise<Card | null> {
  if (!token) return null;
  const sql = await getSql();
  const [r] = await sql`SELECT * FROM loyalty_cards WHERE token = ${token}`;
  return r ? mapCard(r) : null;
}

export async function getCardByKey(key: string): Promise<Card | null> {
  if (!key) return null;
  const sql = await getSql();
  const [r] = await sql`SELECT * FROM loyalty_cards WHERE customer_key = ${key.trim().toLowerCase()}`;
  return r ? mapCard(r) : null;
}

export async function getCardByRef(code: string): Promise<Card | null> {
  const c = normalizeRefCode(code);
  if (c.length < 4) return null;
  const sql = await getSql();
  const [r] = await sql`SELECT * FROM loyalty_cards WHERE ref_code = ${c}`;
  return r ? mapCard(r) : null;
}

/** Name und Geburtsdatum: zuerst die Angaben beim Kundenkonto, sonst aus den Buchungen (neuester Eintrag) */
async function bookingProfile(key: string): Promise<{ name: string; birthDate: string }> {
  const sql = await getSql();
  const [[own], [r]] = await Promise.all([
    sql`SELECT name, birth_date FROM customers WHERE key = ${key}`.catch(() => []),
    sql`
    SELECT (array_agg(customer_name ORDER BY starts_at DESC))[1] AS name,
           (array_agg(birth_date ORDER BY starts_at DESC) FILTER (WHERE birth_date <> ''))[1] AS birth_date
    FROM bookings WHERE customer_email <> '' AND lower(customer_email) = ${key}`,
  ]);
  return { name: String(own?.name || r?.name || ""), birthDate: String(own?.birth_date || r?.birth_date || "") };
}

/** Karte zur E-Mail holen oder anlegen. Den Namen aus den Buchungen hält sie aktuell. */
export async function ensureCard(email: string, fallbackName = ""): Promise<Card> {
  const key = email.trim().toLowerCase();
  if (!key || key.startsWith("tel:")) throw new Error("Stempelkarte braucht eine E-Mail");
  const sql = await getSql();
  const profile = await bookingProfile(key);
  const name = (profile.name || fallbackName).slice(0, 80);
  let card = await getCardByKey(key);
  for (let attempt = 0; !card && attempt < 5; attempt++) {
    try {
      await sql`INSERT INTO loyalty_cards (customer_key, token, ref_code, name)
                VALUES (${key}, ${newToken()}, ${newRefCode()}, ${name}) ON CONFLICT (customer_key) DO NOTHING`;
    } catch {
      // Token oder Code zufällig schon vergeben: nochmals mit neuen Werten
    }
    card = await getCardByKey(key);
  }
  if (!card) throw new Error("Stempelkarte konnte nicht angelegt werden");
  if (name && name !== card.name) {
    await sql`UPDATE loyalty_cards SET name = ${name} WHERE id = ${card.id}`;
    card.name = name;
  }
  return card;
}

/* ---------- Stand einer Karte ---------- */

export type StampEntry = { seq: number; kind: StampKind; delta: number; actor: string; reason: string; year: number | null; refName: string; createdAt: Date };

export type CardState = {
  card: Card;
  settings: LoyaltySettings;
  /** Summe aller Einträge */
  balance: number;
  /** letzte Eintragsnummer (für den Doppelstempel-Schutz) */
  seq: number;
  /** Stempel auf der aktuellen Karte (0 … stampsNeeded) */
  onCard: number;
  /** Art jedes Stempels auf der aktuellen Karte, ältester zuerst: visit, referral, review … */
  onCardKinds: string[];
  rewardsAvailable: number;
  visits: number;
  redeemed: number;
  lastVisitAt: Date | null;
  recentVisit: boolean;
  reviewGiven: boolean;
  birthDate: string;
  birthdayInMonth: boolean;
  birthdayRedeemed: boolean;
  birthdayAvailable: boolean;
  referredBy: { name: string; refCode: string; rewarded: boolean } | null;
  referrals: { count: number; rewarded: number };
  /** neu = noch kein Besuchsstempel und keine früheren Termine (für Empfehlungen) */
  isNew: boolean;
  log: StampEntry[];
};

const toDateOrNull = (v: unknown) => (v == null ? null : v instanceof Date ? v : new Date(String(v)));

/** Zürcher Jahr und Monat von heute */
function todayYm() {
  const [y, m] = toDateKey(new Date()).split("-").map(Number);
  return { year: y, month: m };
}

/** Hatte dieser Kunde schon vor heute einen Termin, zu dem er gekommen ist? */
async function hadEarlierVisit(key: string) {
  const sql = await getSql();
  const todayStart = zurichToDate(toDateKey(new Date()), "00:00").toISOString();
  const [r] = await sql`SELECT 1 AS x FROM bookings WHERE customer_email <> '' AND lower(customer_email) = ${key}
                        AND status = 'confirmed' AND NOT no_show AND starts_at < ${todayStart}::timestamptz LIMIT 1`;
  return !!r;
}

/**
 * Welche Stempel liegen gerade auf der Karte? Gutschriften kommen hinten dazu,
 * eine Einlösung nimmt die ältesten weg, eine negative Korrektur die neuesten.
 */
function stampKinds(rows: Record<string, unknown>[], needed: number): string[] {
  const q: string[] = [];
  for (const r of rows) {
    const delta = Number(r.delta);
    const kind = String(r.kind);
    if (delta > 0) for (let i = 0; i < delta; i++) q.push(kind);
    else if (delta < 0) {
      if (kind === "redeem") q.splice(0, -delta);
      else q.splice(Math.max(0, q.length + delta), -delta);
    }
  }
  return q.slice(0, needed);
}

export async function getCardState(card: Card, opts: { logLimit?: number } = {}): Promise<CardState> {
  const sql = await getSql();
  const settings = await getLoyaltySettings();
  const { year, month } = todayYm();
  const [agg] = await sql`
    SELECT coalesce(sum(delta), 0)::int AS balance, coalesce(max(seq), 0)::int AS seq,
           count(*) FILTER (WHERE kind = 'visit')::int AS visits,
           count(*) FILTER (WHERE kind = 'redeem')::int AS redeemed,
           max(created_at) FILTER (WHERE kind = 'visit') AS last_visit_at,
           bool_or(kind = 'review') AS review_given,
           bool_or(kind = 'birthday' AND year = ${year}) AS birthday_redeemed
    FROM loyalty_stamps WHERE card_id = ${card.id}`;
  const log = await sql`
    SELECT s.*, rc.name AS ref_name FROM loyalty_stamps s LEFT JOIN loyalty_cards rc ON rc.id = s.ref_card_id
    WHERE s.card_id = ${card.id} ORDER BY s.seq DESC LIMIT ${opts.logLimit ?? 50}`;
  const [refBy] = await sql`
    SELECT r.rewarded_at, c.name, c.ref_code FROM loyalty_referrals r JOIN loyalty_cards c ON c.id = r.referrer_card_id
    WHERE r.referred_card_id = ${card.id}`;
  const [refs] = await sql`SELECT count(*)::int AS n, count(rewarded_at)::int AS rewarded FROM loyalty_referrals WHERE referrer_card_id = ${card.id}`;
  const all = await sql`SELECT kind, delta FROM loyalty_stamps WHERE card_id = ${card.id} ORDER BY seq`;

  const balance = Number(agg?.balance ?? 0);
  const needed = settings.stampsNeeded;
  const rewardsAvailable = Math.max(0, Math.floor(balance / needed));
  const visits = Number(agg?.visits ?? 0);
  const lastVisitAt = toDateOrNull(agg?.last_visit_at);
  const birthDate = card.birthDate || (await bookingProfile(card.customerKey)).birthDate;
  const birthdayInMonth = !!birthDate && Number(birthDate.slice(5, 7)) === month;
  const birthdayRedeemed = !!agg?.birthday_redeemed;
  return {
    card,
    settings,
    balance,
    seq: Number(agg?.seq ?? 0),
    onCard: rewardsAvailable ? needed : Math.max(0, balance),
    onCardKinds: stampKinds(all, needed),
    rewardsAvailable,
    visits,
    redeemed: Number(agg?.redeemed ?? 0),
    lastVisitAt,
    recentVisit: !!lastVisitAt && Date.now() - lastVisitAt.getTime() < RECENT_VISIT_HOURS * 3600_000,
    reviewGiven: !!agg?.review_given,
    birthDate,
    birthdayInMonth,
    birthdayRedeemed,
    birthdayAvailable: settings.birthdayEnabled && birthdayInMonth && !birthdayRedeemed,
    referredBy: refBy ? { name: String(refBy.name ?? ""), refCode: String(refBy.ref_code), rewarded: !!refBy.rewarded_at } : null,
    referrals: { count: Number(refs?.n ?? 0), rewarded: Number(refs?.rewarded ?? 0) },
    isNew: visits === 0 && !(await hadEarlierVisit(card.customerKey)),
    log: log.map((r) => ({
      seq: Number(r.seq),
      kind: r.kind as StampKind,
      delta: Number(r.delta),
      actor: String(r.actor ?? ""),
      reason: String(r.reason ?? ""),
      year: r.year == null ? null : Number(r.year),
      refName: String(r.ref_name ?? ""),
      createdAt: toDateOrNull(r.created_at)!,
    })),
  };
}

/* ---------- Buchen ---------- */

export type StampResult = "ok" | "conflict" | "recent" | "notAvailable" | "disabled";

const isUniqueViolation = (e: unknown) => (e as { code?: string } | null)?.code === "23505" || /duplicate key|unique/i.test(String((e as Error)?.message));

/**
 * Einen Eintrag anhängen, aber nur, wenn die Karte seit dem Anzeigen unverändert ist (expectSeq)
 * und, falls minBalance gesetzt ist, genug Stempel da sind. Alles in einer Anweisung.
 */
async function append(cardId: number, expectSeq: number, e: { kind: StampKind; delta: number; actor: string; reason?: string; refCardId?: number | null; year?: number | null }, minBalance?: number): Promise<boolean> {
  const sql = await getSql();
  try {
    const rows = await sql.query(
      `INSERT INTO loyalty_stamps (card_id, seq, kind, delta, actor, reason, ref_card_id, year)
       SELECT $1, $2::int + 1, $3, $4, $5, $6, $7, $8
       WHERE (SELECT coalesce(max(seq), 0) FROM loyalty_stamps WHERE card_id = $1) = $2::int
         AND ($9::int IS NULL OR (SELECT coalesce(sum(delta), 0) FROM loyalty_stamps WHERE card_id = $1) >= $9::int)
       RETURNING id`,
      [cardId, expectSeq, e.kind, e.delta, e.actor.slice(0, 60), (e.reason ?? "").slice(0, 300), e.refCardId ?? null, e.year ?? null, minBalance ?? null],
    );
    return rows.length > 0;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}

/** Eintrag ohne bekannten Stand (System, z. B. Empfehlungsbonus): bei gleichzeitiger Buchung nochmals versuchen */
async function appendAuto(cardId: number, e: Parameters<typeof append>[2]) {
  const sql = await getSql();
  for (let attempt = 0; attempt < 6; attempt++) {
    const [r] = await sql`SELECT coalesce(max(seq), 0)::int AS seq FROM loyalty_stamps WHERE card_id = ${cardId}`;
    if (await append(cardId, Number(r?.seq ?? 0), e)) return true;
  }
  return false;
}

type Ctx = { state: CardState; expectSeq: number; actor: string };

/** +1 Stempel für einen Besuch mit Haarschnitt. Gibt beim ersten Besuch eines empfohlenen Neukunden den Bonus. */
export async function stampVisit({ state, expectSeq, actor }: Ctx, force = false): Promise<StampResult> {
  if (state.seq !== expectSeq) return "conflict";
  if (state.recentVisit && !force) return "recent";
  if (!(await append(state.card.id, expectSeq, { kind: "visit", delta: 1, actor }))) return "conflict";
  if (state.visits === 0) await grantReferralBonus(state.card.id, state.settings).catch((e) => console.error("[GYAN] Empfehlungsbonus:", e));
  return "ok";
}

async function grantReferralBonus(referredCardId: number, settings: LoyaltySettings) {
  if (!settings.referralEnabled) return;
  const sql = await getSql();
  // Atomar: der Bonus geht pro empfohlener Person genau einmal raus
  const [r] = await sql`UPDATE loyalty_referrals SET rewarded_at = now() WHERE referred_card_id = ${referredCardId} AND rewarded_at IS NULL RETURNING referrer_card_id`;
  if (!r) return;
  await appendAuto(Number(r.referrer_card_id), { kind: "referral", delta: 1, actor: "System", refCardId: referredCardId });
}

/** Gratis-Haarschnitt einlösen: zieht eine volle Karte ab */
export async function redeemReward({ state, expectSeq, actor }: Ctx): Promise<StampResult> {
  if (state.seq !== expectSeq) return "conflict";
  if (state.rewardsAvailable < 1) return "notAvailable";
  const needed = state.settings.stampsNeeded;
  return (await append(state.card.id, expectSeq, { kind: "redeem", delta: -needed, actor }, needed)) ? "ok" : "conflict";
}

/** Geburtstags-Haarschnitt einlösen (einmal pro Jahr, im Geburtsmonat) */
export async function redeemBirthday({ state, expectSeq, actor }: Ctx): Promise<StampResult> {
  if (!state.settings.birthdayEnabled) return "disabled";
  if (state.seq !== expectSeq) return "conflict";
  if (!state.birthdayAvailable) return "notAvailable";
  return (await append(state.card.id, expectSeq, { kind: "birthday", delta: 0, actor, year: todayYm().year })) ? "ok" : "conflict";
}

/** Einmaliger Stempel für eine Google-Bewertung, unabhängig davon, wie sie ausfällt */
export async function stampReview({ state, expectSeq, actor }: Ctx): Promise<StampResult> {
  if (!state.settings.reviewEnabled) return "disabled";
  if (state.seq !== expectSeq) return "conflict";
  if (state.reviewGiven) return "notAvailable";
  return (await append(state.card.id, expectSeq, { kind: "review", delta: 1, actor })) ? "ok" : "conflict";
}

/** Korrektur von Hand (±), immer mit Grund. Der Stand kann nicht unter 0 fallen. */
export async function correctStamps({ state, expectSeq, actor }: Ctx, delta: number, reason: string): Promise<StampResult> {
  if (state.seq !== expectSeq) return "conflict";
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 50 || !reason.trim()) return "notAvailable";
  if (state.balance + delta < 0) return "notAvailable";
  return (await append(state.card.id, expectSeq, { kind: "correction", delta, actor, reason: reason.trim() }, delta < 0 ? -delta : undefined)) ? "ok" : "conflict";
}

export type ReferralResult = "ok" | "invalid" | "self" | "notNew" | "already" | "disabled";

/**
 * Empfehlung verknüpfen: nur für Neukunden (noch kein Besuchsstempel, kein früherer Termin),
 * nur einmal pro Karte und nie mit dem eigenen Code.
 */
export async function linkReferral(card: Card, code: string): Promise<ReferralResult> {
  const settings = await getLoyaltySettings();
  if (!settings.referralEnabled) return "disabled";
  const referrer = await getCardByRef(code);
  if (!referrer) return "invalid";
  if (referrer.id === card.id || referrer.customerKey === card.customerKey) return "self";
  const sql = await getSql();
  const [existing] = await sql`SELECT 1 AS x FROM loyalty_referrals WHERE referred_card_id = ${card.id}`;
  if (existing) return "already";
  const [visit] = await sql`SELECT 1 AS x FROM loyalty_stamps WHERE card_id = ${card.id} AND kind = 'visit' LIMIT 1`;
  if (visit || (await hadEarlierVisit(card.customerKey))) return "notNew";
  // Gegenseitig empfehlen geht nicht
  const [loop] = await sql`SELECT 1 AS x FROM loyalty_referrals WHERE referred_card_id = ${referrer.id} AND referrer_card_id = ${card.id}`;
  if (loop) return "self";
  const rows = await sql`INSERT INTO loyalty_referrals (referred_card_id, referrer_card_id) VALUES (${card.id}, ${referrer.id}) ON CONFLICT DO NOTHING RETURNING referred_card_id`;
  return rows.length ? "ok" : "already";
}

export async function setCardBirthDate(cardId: number, birthDate: string) {
  const sql = await getSql();
  await sql`UPDATE loyalty_cards SET birth_date = ${birthDate} WHERE id = ${cardId}`;
}

/** Karte mit allen Einträgen und Empfehlungen löschen (Datenschutz). Boni, die andere bekamen, bleiben. */
export async function deleteCard(cardId: number) {
  const sql = await getSql();
  await sql`DELETE FROM loyalty_cards WHERE id = ${cardId}`;
}

/* ---------- Übersicht ---------- */

export type CardRow = Card & {
  balance: number;
  visits: number;
  redeemed: number;
  birthdays: number;
  reviews: number;
  referralsMade: number;
  referralsRewarded: number;
  referredBy: string;
  lastAt: Date | null;
};

export async function listCards(search = ""): Promise<CardRow[]> {
  const sql = await getSql();
  const q = `%${search.trim().toLowerCase()}%`;
  const rows = await sql.query(
    `SELECT c.*, coalesce(s.balance, 0)::int AS balance, coalesce(s.visits, 0)::int AS visits, coalesce(s.redeemed, 0)::int AS redeemed,
            coalesce(s.birthdays, 0)::int AS birthdays, coalesce(s.reviews, 0)::int AS reviews, s.last_at,
            coalesce(r.made, 0)::int AS referrals_made, coalesce(r.rewarded, 0)::int AS referrals_rewarded, rc.name AS referred_by
     FROM loyalty_cards c
     LEFT JOIN (SELECT card_id, sum(delta) AS balance, count(*) FILTER (WHERE kind = 'visit') AS visits,
                       count(*) FILTER (WHERE kind = 'redeem') AS redeemed, count(*) FILTER (WHERE kind = 'birthday') AS birthdays,
                       count(*) FILTER (WHERE kind = 'review') AS reviews, max(created_at) AS last_at
                FROM loyalty_stamps GROUP BY card_id) s ON s.card_id = c.id
     LEFT JOIN (SELECT referrer_card_id, count(*) AS made, count(rewarded_at) AS rewarded FROM loyalty_referrals GROUP BY referrer_card_id) r ON r.referrer_card_id = c.id
     LEFT JOIN loyalty_referrals rb ON rb.referred_card_id = c.id
     LEFT JOIN loyalty_cards rc ON rc.id = rb.referrer_card_id
     WHERE $1 = '%%' OR lower(c.name) LIKE $1 OR c.customer_key LIKE $1 OR lower(c.ref_code) LIKE $1
     ORDER BY coalesce(s.last_at, c.created_at) DESC
     LIMIT 500`,
    [q],
  );
  return rows.map((r) => ({
    ...mapCard(r),
    balance: Number(r.balance),
    visits: Number(r.visits),
    redeemed: Number(r.redeemed),
    birthdays: Number(r.birthdays),
    reviews: Number(r.reviews),
    referralsMade: Number(r.referrals_made),
    referralsRewarded: Number(r.referrals_rewarded),
    referredBy: String(r.referred_by ?? ""),
    lastAt: toDateOrNull(r.last_at),
  }));
}

/** Letzte Einträge über alle Karten (Scanner-Seite) */
export async function recentStamps(limit = 8) {
  const sql = await getSql();
  const rows = await sql`
    SELECT s.kind, s.delta, s.created_at, s.actor, c.name, c.customer_key, c.token
    FROM loyalty_stamps s JOIN loyalty_cards c ON c.id = s.card_id
    ORDER BY s.created_at DESC LIMIT ${limit}`;
  return rows.map((r) => ({
    kind: r.kind as StampKind,
    delta: Number(r.delta),
    createdAt: toDateOrNull(r.created_at)!,
    actor: String(r.actor ?? ""),
    name: String(r.name || r.customer_key),
    token: String(r.token),
  }));
}

/** Team für «Wer hat gestempelt?» (aus der Kasse), leer wenn es die Tabelle nicht gibt */
export async function listStaffNames(): Promise<string[]> {
  const sql = await getSql();
  const rows = await sql`SELECT name FROM staff WHERE active ORDER BY sort, name`.catch(() => [] as Row[]);
  return rows.map((r) => String(r.name));
}

/* ---------- Geburtstag ---------- */

/**
 * Karten, deren Geburtstag heute ist und die dieses Jahr noch keinen Gruss bekamen.
 * Atomar reserviert, damit kein Gruss doppelt rausgeht. Nur mit Werbe-Einwilligung und ohne Werbesperre.
 */
export async function claimBirthdayGreetings(): Promise<{ card: Card; locale: string }[]> {
  const sql = await getSql();
  const today = toDateKey(new Date());
  const year = Number(today.slice(0, 4));
  const mmdd = today.slice(5);
  // 29. Februar: in Jahren ohne Schalttag am 28. Februar gratulieren
  const leap = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1;
  const days = mmdd === "02-28" && !leap ? ["02-28", "02-29"] : [mmdd];
  const rows = await sql.query(
    `WITH b AS (
       SELECT lower(customer_email) AS key,
              (array_agg(birth_date ORDER BY starts_at DESC) FILTER (WHERE birth_date <> ''))[1] AS birth_date,
              (array_agg(locale ORDER BY starts_at DESC))[1] AS locale,
              bool_or(marketing_consent) AS consent
       FROM bookings WHERE customer_email <> '' GROUP BY 1
     )
     UPDATE loyalty_cards c SET birthday_notified_year = $1
     FROM b LEFT JOIN customers cu ON cu.key = b.key
     WHERE b.key = c.customer_key AND b.consent AND NOT coalesce(cu.no_marketing, false) AND NOT coalesce(cu.blocked, false)
       AND substr(CASE WHEN c.birth_date <> '' THEN c.birth_date ELSE coalesce(b.birth_date, '') END, 6, 5) = ANY($2::text[])
       AND coalesce(c.birthday_notified_year, 0) <> $1
     RETURNING c.*, b.locale`,
    [year, days],
  );
  return rows.map((r) => ({ card: mapCard(r), locale: String(r.locale ?? "de") }));
}
