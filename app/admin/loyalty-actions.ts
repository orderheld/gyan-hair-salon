"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import {
  correctStamps,
  deleteCard,
  ensureCard,
  getCardByToken,
  getCardState,
  linkReferral,
  redeemBirthday,
  redeemReward,
  saveLoyaltySettings,
  setCardBirthDate,
  stampReview,
  STAFF_COOKIE,
  stampVisit,
  type StampResult,
} from "@/lib/loyalty";
import { syncGoogleWallet } from "@/lib/wallet";
import { isBirthDate } from "@/lib/time";

const str = (fd: FormData, key: string, max = 300) => String(fd.get(key) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const cardPath = (token: string) => `/admin/stempel/karte/${encodeURIComponent(token)}`;
const go = (path: string, params: Record<string, string>): never => redirect(`${path}?${new URLSearchParams(params)}`);

/** Karte und aktuellen Stand fürs Formular laden, Wer-stempelt merken */
async function load(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const token = str(fd, "token", 80);
  const card = await getCardByToken(token);
  if (!card) go("/admin/stempel", { error: t.loyalty.notFound });
  const state = await getCardState(card!);
  const actor = str(fd, "actor", 60) || "Admin";
  if (fd.has("actor")) (await cookies()).set(STAFF_COOKIE, actor, { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true });
  return { t: t.loyalty, token, state, actor, expectSeq: Number(str(fd, "seq", 10)) };
}

async function finish(token: string, result: StampResult, okMsg: string, t: Awaited<ReturnType<typeof load>>["t"]): Promise<never> {
  if (result === "ok") {
    const card = await getCardByToken(token);
    if (card) await syncGoogleWallet(await getCardState(card, { logLimit: 1 }));
    return go(cardPath(token), { ok: okMsg });
  }
  if (result === "recent") return go(cardPath(token), { confirm: "visit" });
  const msg = result === "conflict" ? t.conflict : result === "disabled" ? t.disabled : t.notAvailable;
  return go(cardPath(token), { error: msg });
}

export async function loyaltyVisit(fd: FormData) {
  const { t, token, state, actor, expectSeq } = await load(fd);
  await finish(token, await stampVisit({ state, expectSeq, actor }, fd.get("force") === "1"), t.done.visit, t);
}

export async function loyaltyRedeem(fd: FormData) {
  const { t, token, state, actor, expectSeq } = await load(fd);
  await finish(token, await redeemReward({ state, expectSeq, actor }), t.done.redeem, t);
}

export async function loyaltyBirthday(fd: FormData) {
  const { t, token, state, actor, expectSeq } = await load(fd);
  await finish(token, await redeemBirthday({ state, expectSeq, actor }), t.done.birthday, t);
}

export async function loyaltyReview(fd: FormData) {
  const { t, token, state, actor, expectSeq } = await load(fd);
  await finish(token, await stampReview({ state, expectSeq, actor }), t.done.review, t);
}

export async function loyaltyCorrection(fd: FormData) {
  const { t, token, state, actor, expectSeq } = await load(fd);
  const delta = Math.trunc(Number(str(fd, "delta", 6).replace("+", "")));
  await finish(token, await correctStamps({ state, expectSeq, actor }, delta, str(fd, "reason", 300)), t.done.correction, t);
}

export async function loyaltyReferral(fd: FormData) {
  const { t, token, state } = await load(fd);
  const result = await linkReferral(state.card, str(fd, "code", 20));
  if (result === "ok") return go(cardPath(token), { ok: t.done.referral });
  go(cardPath(token), { error: t.refErrors[result] });
}

export async function loyaltyBirthDate(fd: FormData) {
  const { t, token, state } = await load(fd);
  const value = str(fd, "birthDate", 10);
  if (!isBirthDate(value)) go(cardPath(token), { error: t.notAvailable });
  await setCardBirthDate(state.card.id, value);
  go(cardPath(token), { ok: t.done.birthDate });
}

export async function loyaltyDelete(fd: FormData) {
  const { t, state } = await load(fd);
  await deleteCard(state.card.id);
  go("/admin/stempel/kunden", { ok: t.done.deleted });
}

/** Neue Karte für eine E-Mail (Kunde ohne Online-Konto, z. B. ohne Termin gekommen) */
export async function loyaltyCreate(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const email = str(fd, "email", 120).toLowerCase();
  if (!EMAIL.test(email)) go("/admin/stempel", { error: t.loyalty.noEmail });
  const card = await ensureCard(email, str(fd, "name", 80));
  go(cardPath(card.token), { ok: t.loyalty.created });
}

export async function loyaltySaveSettings(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const needed = Math.round(Number(str(fd, "stampsNeeded", 3)));
  await saveLoyaltySettings(
    {
      stampsNeeded: Number.isFinite(needed) ? Math.min(30, Math.max(2, needed)) : 11,
      birthdayEnabled: fd.get("birthdayEnabled") === "on",
      birthdayNotify: fd.get("birthdayNotify") === "on",
      referralEnabled: fd.get("referralEnabled") === "on",
      reviewEnabled: fd.get("reviewEnabled") === "on",
    },
    fd.get("loyaltyPublic") === "on",
  );
  revalidatePath("/", "layout");
  go("/admin/stempel/einstellungen", { ok: t.loyalty.saved });
}
