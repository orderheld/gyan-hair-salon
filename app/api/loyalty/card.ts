import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/content/types";
import { siteLocked } from "@/lib/auth";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { ensureCard, getCardState, isLoyaltyPublic, type CardState } from "@/lib/loyalty";
import { CUSTOMER_COOKIE, readCustomerCookie } from "@/lib/verify";

/** Karte des angemeldeten Kunden für die Wallet-Links, sonst eine fertige Fehlerantwort */
export async function customerCard(request: Request): Promise<{ state: CardState; locale: Locale } | Response> {
  if ((await siteLocked()) || !(await isLoyaltyPublic())) return new Response("Not found", { status: 404 });
  const email = readCustomerCookie((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!email) return new Response("Unauthorized", { status: 401 });
  const l = new URL(request.url).searchParams.get("l");
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  return { state: await getCardState(await ensureCard(email), { logLimit: 1 }), locale };
}
