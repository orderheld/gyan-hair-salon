import type { Locale } from "@/content/types";

export const formatChf = (n: number) => (Number.isInteger(n) ? `CHF ${n}.–` : `CHF ${n.toFixed(2)}`);

const UNITS: Record<Locale, { min: string; h: string }> = {
  de: { min: "Min.", h: "Std." },
  fr: { min: "min", h: "h" },
  en: { min: "min", h: "h" },
};

export function formatDuration(min: number, locale: Locale = "de") {
  const u = UNITS[locale];
  if (min < 60) return `${min} ${u.min}`;
  if (min % 60 === 0) return `${min / 60} ${u.h}`;
  return `${Math.floor(min / 60)} ${u.h} ${min % 60} ${u.min}`;
}
