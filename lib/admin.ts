import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/content/types";
import { getAdminDict } from "./i18n";
import { isLocale } from "./i18n/config";

export const ADMIN_LANG_COOKIE = "gyan_admin_lang";

/** Sprache des Admin-Panels (eigene Einstellung, unabhängig von der Webseite) */
export async function getAdminLocale(): Promise<Locale> {
  const v = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
  return isLocale(v) ? v : "de";
}

export async function getAdminText() {
  const locale = await getAdminLocale();
  return { locale, t: getAdminDict(locale) };
}

/** Text für eine URL-Adresse: "Coupe & barbe" -> "coupe-barbe" */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
