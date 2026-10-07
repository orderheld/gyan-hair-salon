import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/** Absicherung, falls der Proxy "/" nicht abfängt: Sprache wählen und weiterleiten */
export default async function RootRedirect() {
  const cookie = (await cookies()).get("NEXT_LOCALE")?.value;
  if (isLocale(cookie)) redirect(`/${cookie}`);
  const header = (await headers()).get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const lang = ranked.find((r) => isLocale(r.lang))?.lang;
  redirect(`/${lang ?? DEFAULT_LOCALE}`);
}
