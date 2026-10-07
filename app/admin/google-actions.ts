"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import {
  chooseLocation,
  claimReview,
  disconnectGoogle,
  dismissReview,
  getGoogleReview,
  GoogleError,
  releaseReview,
  syncGoogleReviews,
  undoDismiss,
} from "@/lib/google-reviews";
import { getCardById, getCardState, STAFF_COOKIE, stampReview } from "@/lib/loyalty";
import { syncGoogleWallet } from "@/lib/wallet";

const PAGE = "/admin/stempel/bewertungen";
const str = (fd: FormData, key: string, max = 300) => String(fd.get(key) ?? "").trim().slice(0, max);
const go = (params: Record<string, string>, hash = ""): never => redirect(`${PAGE}?${new URLSearchParams(params)}${hash}`);

async function texts() {
  await requireAdmin();
  const { t } = await getAdminText();
  return t.loyalty;
}

/**
 * Bewertungs-Stempel für eine Karte geben und die Bewertung zuordnen.
 * Die Bewertung wird zuerst reserviert (nur wenn noch «neu»), so wird sie nie zweimal vergeben.
 * Hat die Karte den Stempel schon, wird nur zugeordnet. Die Sternzahl spielt keine Rolle.
 */
export async function googleReviewStamp(fd: FormData) {
  const t = await texts();
  const g = t.google;
  const reviewId = str(fd, "review", 200);
  const card = await getCardById(Math.trunc(Number(str(fd, "card", 12))));
  if (!card) go({ error: t.notFound });
  let state = await getCardState(card!);
  if (!state.settings.reviewEnabled) go({ error: t.disabled });
  const review = await getGoogleReview(reviewId);
  if (!review || review.status !== "new" || !(await claimReview(reviewId, card!.id))) go({ error: g.errors.handled });

  const name = card!.name || card!.customerKey;
  if (state.reviewGiven) go({ ok: fill(g.done.linked, { name }) });

  const actor = (await cookies()).get(STAFF_COOKIE)?.value || "Admin";
  let result = await stampReview({ state, expectSeq: state.seq, actor });
  if (result === "conflict") {
    // gleichzeitig etwas anderes auf der Karte gebucht: mit dem neuen Stand nochmals
    state = await getCardState(card!);
    if (state.reviewGiven) go({ ok: fill(g.done.linked, { name }) });
    result = await stampReview({ state, expectSeq: state.seq, actor });
  }
  if (result !== "ok") {
    await releaseReview(reviewId);
    go({ error: result === "disabled" ? t.disabled : result === "conflict" ? t.conflict : t.notAvailable });
  }
  await syncGoogleWallet(await getCardState(card!, { logLimit: 1 })).catch((e) => console.error("[GYAN] Wallet:", e));
  go({ ok: fill(g.done.stamped, { name }) });
}

export async function googleReviewDismiss(fd: FormData) {
  const t = await texts();
  const ok = await dismissReview(str(fd, "review", 200));
  go(ok ? { ok: t.google.done.dismissed } : { error: t.google.errors.handled });
}

export async function googleReviewUndo(fd: FormData) {
  const t = await texts();
  const id = str(fd, "review", 200);
  const ok = await undoDismiss(id);
  go(ok ? { ok: t.google.done.undone } : { error: t.notAvailable });
}

export async function googleSyncNow() {
  const t = await texts();
  let params: Record<string, string>;
  try {
    const r = await syncGoogleReviews();
    params = { ok: fill(t.google.synced, { n: r.added }) };
  } catch (e) {
    console.error("[GYAN] Google-Bewertungen abrufen:", e);
    params = { error: t.google.errors[e instanceof GoogleError ? e.code : "api"] };
  }
  go(params);
}

export async function googleChooseLocation(fd: FormData) {
  const t = await texts();
  if (!(await chooseLocation(str(fd, "location", 200)))) go({ error: t.notAvailable });
  let params: Record<string, string> = { ok: t.google.connectedOk };
  try {
    await syncGoogleReviews();
  } catch (e) {
    params = { error: t.google.errors[e instanceof GoogleError ? e.code : "api"] };
  }
  go(params);
}

export async function googleDisconnect() {
  const t = await texts();
  await disconnectGoogle();
  go({ ok: t.google.disconnected });
}
