import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, comingSoon, hasAdminCookie } from "@/lib/coming-soon";
import { canonicalSegment, DEFAULT_LOCALE, isLocale, toInternalSegment, type Locale } from "@/lib/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(cookie)) return cookie;
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined ?? DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, second, ...rest] = pathname.split("/");

  // Coming soon: Besucher sehen nur /bald, eingeloggte Admins die ganze Seite
  if (comingSoon() && !(await hasAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value))) {
    const url = request.nextUrl.clone();
    url.pathname = "/bald";
    url.search = `?l=${isLocale(first) ? first : preferredLocale(request)}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  // Ohne Sprache: auf die passende Sprache weiterleiten
  if (!isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!second) return NextResponse.next();

  // /fr/leistungen -> /fr/prestations (ein Pfad pro Sprache, gut für Google)
  const canonical = canonicalSegment(first, second);
  if (canonical) {
    const url = request.nextUrl.clone();
    url.pathname = ["", first, canonical, ...rest].join("/");
    return NextResponse.redirect(url, 308);
  }

  // /fr/prestations -> intern /fr/leistungen
  const internal = toInternalSegment(first, second);
  if (internal && internal !== second) {
    const url = request.nextUrl.clone();
    url.pathname = ["", first, internal, ...rest].join("/");
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Nicht für Admin, API, Next-Dateien und Dateien mit Endung (Bilder, robots.txt, sitemap.xml …)
  matcher: ["/", "/((?!admin|api|bald|_next|.*\\..*).*)"],
};

