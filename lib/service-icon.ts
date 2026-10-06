/** Welches Symbol eine Leistung bekommt, über den deutschen Slug. Neue Leistungen bekommen die Schere. */
const MAP: [string, string][] = [
  ["fade", "fade"],
  ["und-bart", "combo"],
  ["bart", "beard"],
  ["rasur", "razor"],
  ["gesicht", "face"],
  ["full-service", "signature"],
  ["paket", "package"],
  ["signature", "style"],
];

export const iconFor = (slugDe: string) => MAP.find(([k]) => slugDe.includes(k))?.[1] ?? "cut";
