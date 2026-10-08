import "server-only";
import type { Faq, Locale } from "@/content/types";
import { getSalonHours, getServices } from "./data";
import { groupHours } from "./hours";
import { fill, getDict } from "./i18n";
import { getLoyaltySettings } from "./loyalty";
import { freeNth } from "./loyalty-text";
import { getSettings } from "./settings";

export type FaqGroup = { title: string; items: Faq[] };

/**
 * FAQ mit echten Werten: Preise und Dauer aus den Leistungen, Absage- und Erinnerungsfrist aus den Regeln,
 * Öffnungszeiten aus content/site.ts. Die Stempelkarten-Frage nur, wenn die Karte für Kunden eingeschaltet ist.
 */
export async function getFaq(locale: Locale): Promise<FaqGroup[]> {
  const d = getDict(locale);
  const [services, settings, hours, loyalty] = await Promise.all([getServices(), getSettings(), getSalonHours(), getLoyaltySettings().catch(() => null)]);
  const svc = (slug: string) => services.find((s) => s.slug.de === slug);
  const price = (slug: string) => String(svc(slug)?.priceChf ?? "");
  const walkin = (slug: string) => String(svc(slug)?.walkinPriceChf ?? svc(slug)?.priceChf ?? "");
  const min = (slug: string) => String(svc(slug)?.durationMin ?? "");
  const vars: Record<string, string | number> = {
    cut: price("haarschnitt-biel"),
    cutWalkin: walkin("haarschnitt-biel"),
    cutMin: min("haarschnitt-biel"),
    classic: price("haarschnitt-und-bart"),
    classicWalkin: walkin("haarschnitt-und-bart"),
    classicMin: min("haarschnitt-und-bart"),
    beard: price("bart-trimmen-biel"),
    beardMin: min("bart-trimmen-biel"),
    shave: price("nassrasur-biel"),
    shaveMin: min("nassrasur-biel"),
    premium: price("gyan-premium-paket"),
    full: price("gyan-full-service"),
    horizon: settings.horizonDays,
    cancelH: settings.cancelNoticeHours,
    remindH: settings.reminderHoursBefore,
    hours: groupHours(hours, d.common.weekdaysShort).map((r) => `${r.days} ${r.time ?? d.common.closed.toLowerCase()}`).join(", "),
    nth: loyalty ? freeNth(loyalty.stampsNeeded, locale) : "",
  };
  return d.faq.groups
    .map((g) => ({
      title: g.title,
      items: g.items
        .filter((f) => !("only" in f) || (f.only === "loyalty" ? !!loyalty?.loyaltyPublic : settings.emailEnabled.reminder))
        .map((f) => ({ q: fill(f.q, vars), a: fill(f.a, vars) })),
    }))
    .filter((g) => g.items.length > 0);
}
