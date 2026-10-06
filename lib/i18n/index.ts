import type { Locale } from "@/content/types";
import adminDe, { type AdminDict } from "./admin/de";
import adminEn from "./admin/en";
import adminFr from "./admin/fr";
import de, { type Dict } from "./dict/de";
import en from "./dict/en";
import fr from "./dict/fr";

const dicts: Record<Locale, Dict> = { de, fr, en };
const adminDicts: Record<Locale, AdminDict> = { de: adminDe, fr: adminFr, en: adminEn };

export const getDict = (locale: Locale): Dict => dicts[locale] ?? de;
export const getAdminDict = (locale: Locale): AdminDict => adminDicts[locale] ?? adminDe;
export type { Dict, AdminDict };

export { fill } from "./fill";
