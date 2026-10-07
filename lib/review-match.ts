/**
 * Vorschläge für Google-Bewertungen: welche Stempelkarte passt zum Namen in der Bewertung?
 * Ohne Datenbank und ohne server-only, damit es sich direkt testen lässt (tests/review-match.test.mjs).
 * Nur der Name zählt, die Sternzahl spielt keine Rolle.
 */

export type CardCandidate = { id: number; name: string; email: string; token: string; reviewGiven: boolean };
export type Suggestion = CardCandidate & { score: number };

/** Klein, ohne Akzente, nur Buchstaben: "Zoë  Müller-Brand" -> ["zoe", "muller", "brand"] */
export function nameTokens(v: string): string[] {
  return v
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, " ")
    .split(" ")
    .map((t) => t.replace(/\./g, ""))
    .filter(Boolean);
}

/** gleich, oder bei längeren Namen ein Tippfehler Unterschied */
function close(a: string, b: string) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++diff > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}

/** Wie gut passt ein Name zu einem Bewertungsnamen? 0 = gar nicht, 100 = Vor- und Nachname gleich */
export function nameScore(review: string[], card: string[]): number {
  if (!review.length || !card.length) return 0;
  const rFirst = review[0];
  const rLast = review.length > 1 ? review[review.length - 1] : "";
  const has = (t: string) => card.some((c) => close(c, t));
  const cFirst = card[0];
  const cLast = card.length > 1 ? card[card.length - 1] : "";
  if (rLast) {
    if (rLast.length === 1) {
      // «Sarah K.»: Vorname gleich, Initiale des Nachnamens passt
      if (close(rFirst, cFirst) && card.slice(1).some((c) => c[0] === rLast)) return 80;
    } else {
      const full = review.filter((t) => t.length > 1);
      if (full.every(has)) return close(rFirst, cFirst) || close(rLast, cLast) ? 100 : 90;
      if (has(rFirst) && has(rLast)) return 90;
    }
  }
  if (close(rFirst, cFirst)) return !rLast && card.length === 1 ? 60 : 50; // nur der Vorname: schwächer
  if (rLast.length > 1 && has(rLast)) return 45; // nur der Nachname
  return 0;
}

/** Bis zu 3 passende Karten. Name der Karte oder der vordere Teil der E-Mail (lukas.meier@…) */
export function suggestCards(reviewerName: string, cards: CardCandidate[], limit = 3): Suggestion[] {
  const r = nameTokens(reviewerName);
  if (!r.length) return [];
  return cards
    .map((c) => {
      const byName = nameScore(r, nameTokens(c.name));
      const local = c.email.split("@")[0] ?? "";
      const byEmail = nameScore(r, nameTokens(local.replace(/[._\-+0-9]+/g, " "))) - 10;
      return { ...c, score: Math.max(byName, byEmail) };
    })
    .filter((c) => c.score >= 45)
    .sort((a, b) => b.score - a.score || Number(a.reviewGiven) - Number(b.reviewGiven) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** Manuelle Suche: Name oder E-Mail enthält den Text */
export function searchCards(query: string, cards: CardCandidate[], limit = 8): Suggestion[] {
  const q = nameTokens(query);
  const raw = query.trim().toLowerCase();
  if (!raw) return [];
  return cards
    .filter((c) => {
      const hay = nameTokens(`${c.name} ${c.email}`).join(" ");
      return c.email.includes(raw) || (q.length > 0 && q.every((t) => hay.includes(t)));
    })
    .slice(0, limit)
    .map((c) => ({ ...c, score: 0 }));
}

/** E-Mail für die Anzeige kürzen: lukas.meier@gmail.com -> lu•••@gmail.com */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email.length > 4 ? `${email.slice(0, 2)}•••` : email;
  return `${local.slice(0, Math.min(2, Math.max(1, local.length - 1)))}•••@${domain}`;
}
