/** Welches Symbol eine Leistung bekommt, über den deutschen Slug. Neue Leistungen bekommen die Schere. */
const MAP: [string, string][] = [
  ["fade", "fade"],
  ["und-bart", "combo"],
  ["bart", "beard"],
  ["rasur", "razor"],
  ["kinder", "kids"],
  ["signature", "signature"],
];

export const iconFor = (slugDe: string) => MAP.find(([k]) => slugDe.includes(k))?.[1] ?? "cut";
