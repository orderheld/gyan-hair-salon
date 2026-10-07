import "server-only";
import type { Locale } from "@/content/types";
import { sendBirthdayGreeting } from "./email";
import { getDict } from "./i18n";
import { href, isLocale } from "./i18n/config";
import { claimBirthdayGreetings, getLoyaltySettings } from "./loyalty";
import { pushToCustomerKey } from "./push";
import { toTimeKey } from "./time";

/**
 * Geburtstagsgruss der Stempelkarte (läuft mit den E-Mail-Jobs).
 * Nur wenn die Karte für Kunden sichtbar ist, Geburtstags-Haarschnitt und Gruss eingeschaltet sind,
 * zwischen 9 und 20 Uhr und nur an Kunden mit Werbe-Einwilligung (siehe claimBirthdayGreetings).
 */
export async function runLoyaltyJobs() {
  const s = await getLoyaltySettings();
  if (!s.loyaltyPublic || !s.birthdayEnabled || !s.birthdayNotify) return 0;
  const t = toTimeKey(new Date());
  if (t < "09:00" || t >= "20:00") return 0;
  const due = await claimBirthdayGreetings();
  for (const { card, locale: l } of due) {
    const locale: Locale = isLocale(l) ? l : "de";
    const m = getDict(locale).loyalty.birthdayMail;
    const firstName = card.name.trim().split(" ")[0] ?? "";
    await Promise.allSettled([
      sendBirthdayGreeting(card.customerKey, card.name, locale),
      pushToCustomerKey(card.customerKey, { title: m.subject.replace("{firstName}", firstName), body: m.push, url: href(locale, "loyalty"), tag: `gyan-birthday-${card.id}` }),
    ]);
  }
  return due.length;
}
