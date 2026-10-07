// Ordnungszahl für «jeder 12. Haarschnitt» in allen Sprachen (ohne Abhängigkeiten)
export function ordinal(n: number, locale: string): string {
  if (locale === "fr") return n === 1 ? "1er" : `${n}e`;
  if (locale === "en") {
    const rest = n % 100;
    const suffix = rest >= 11 && rest <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
    return `${n}${suffix}`;
  }
  return `${n}.`;
}

/** Der Haarschnitt nach einer vollen Karte ist gratis: bei 11 Stempeln der 12. */
export const freeNth = (stampsNeeded: number, locale: string) => ordinal(stampsNeeded + 1, locale);
