import { getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, href, isLocale } from "@/lib/i18n/config";

// App-Manifest der Webseite: «Zum Home-Bildschirm» öffnet GYAN wie eine eigene App
export function GET(request: Request) {
  const l = new URL(request.url).searchParams.get("l");
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const d = getDict(locale);
  const manifest = {
    id: "/",
    name: "GYAN Hair Salon",
    short_name: "GYAN",
    description: d.meta.siteDescription,
    lang: locale,
    dir: "ltr",
    start_url: `/${locale}?app=1`,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#fbf8f3",
    theme_color: "#fbf8f3",
    categories: ["beauty", "lifestyle", "business"],
    icons: [
      { src: "/icons/app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/app-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: d.common.book, short_name: d.common.bookShort, url: href(locale, "booking"), icons: [{ src: "/icons/app-192.png", sizes: "192x192" }] },
      { name: d.nav.services, url: href(locale, "services"), icons: [{ src: "/icons/app-192.png", sizes: "192x192" }] },
      { name: d.nav.contact, url: href(locale, "contact"), icons: [{ src: "/icons/app-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
