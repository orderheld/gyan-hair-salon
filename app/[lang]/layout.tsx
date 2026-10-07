import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { posts } from "@/content/blog";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import { site } from "@/content/site";
import { Motion } from "@/components/motion/Motion";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/Blocks";
import { getSalonHours, getServices, localize } from "@/lib/data";
import { SCHEMA_DAYS } from "@/lib/hours";
import { getDict } from "@/lib/i18n";
import { href, isLocale } from "@/lib/i18n/config";
import { APP_ICONS } from "@/lib/app-icons";
import { AppShell } from "@/components/site/AppShell";
import "../styles/base.css";
import "../styles/site.css";

// Seiten werden zwischengespeichert und nach Änderungen im Admin sofort neu erzeugt (revalidatePath).
// Spätestens alle 10 Minuten frisch, damit z. B. Öffnungszeiten im Footer stimmen.
export const revalidate = 600;
// Leere Liste: nichts beim Build vorrendern, aber jede Seite nach dem ersten Aufruf zwischenspeichern
export function generateStaticParams() {
  return [];
}

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-tight", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif-i", display: "swap" });

export const viewport: Viewport = { themeColor: "#fbf8f3", width: "device-width", initialScale: 1, viewportFit: "cover" };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const d = getDict(isLocale(lang) ? lang : "de");
  return {
    metadataBase: new URL(site.url),
    title: { default: d.meta.siteTitle, template: `%s · ${d.meta.titleSuffix}` },
    description: d.meta.siteDescription,
    applicationName: site.name,
    formatDetection: { telephone: false },
    manifest: `/site.webmanifest?l=${isLocale(lang) ? lang : "de"}`,
    icons: APP_ICONS,
    appleWebApp: { capable: true, title: "GYAN", statusBarStyle: "default" },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang;
  const d = getDict(locale);
  const [services, hours] = await Promise.all([getServices(), getSalonHours()]);

  const nav = [
    { href: href(locale, "zana"), label: d.nav.zana },
    { href: href(locale, "services"), label: d.nav.services },
    { href: href(locale, "salon"), label: d.nav.salon },
    { href: href(locale, "blog"), label: d.nav.blog },
    { href: href(locale, "loyalty"), label: d.nav.loyalty },
    { href: href(locale, "social"), label: d.nav.social },
    { href: href(locale, "faq"), label: d.nav.faq },
    { href: href(locale, "contact"), label: d.nav.contact },
  ];
  const slugIndex = [...services, ...posts, ...topics, ...places].map((x) => x.slug);

  const business = {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "BarberShop"],
    "@id": `${site.url}/#salon`,
    legalName: site.legalName,
    taxID: site.uid,
    name: site.name,
    description: d.meta.siteDescription,
    url: `${site.url}/${locale}`,
    image: [`${site.url}${site.images.hero}`, `${site.url}${site.images.lounge}`],
    logo: `${site.url}/brand/logo-email.png`,
    telephone: site.phone,
    email: site.email,
    priceRange: services.length ? `CHF ${Math.min(...services.map((s) => s.priceChf))}–${Math.max(...services.map((s) => s.priceChf))}` : undefined,
    currenciesAccepted: "CHF",
    paymentAccepted: "Cash, Credit Card, Debit Card, TWINT",
    foundingDate: String(site.founded),
    founder: { "@type": "Person", name: site.owner },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.zip,
      addressLocality: "Biel/Bienne",
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    hasMap: site.address.mapsUrl,
    areaServed: ["Biel/Bienne", "Nidau", "Brügg", "Port", "Ipsach", "Evilard", "Orpund", "Lyss", "Pieterlen", "Studen", "Seeland"].map((n) => ({ "@type": "City", name: n })),
    knowsLanguage: ["de", "fr", "en"],
    sameAs: [site.instagram, site.tiktok, site.facebook],
    openingHoursSpecification: hours
      .filter((h) => h.isOpen)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAYS[h.weekday], opens: h.openTime, closes: h.closeTime })),
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}${href(locale, "booking")}`, inLanguage: locale },
      result: { "@type": "Reservation", name: d.common.bookCta },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: d.nav.services,
      itemListElement: services.map((s) => {
        const l = localize(s, locale);
        return {
          "@type": "Offer",
          price: s.priceChf,
          priceCurrency: "CHF",
          url: `${site.url}${href(locale, "services", l.slug)}`,
          itemOffered: { "@type": "Service", name: l.name, description: l.short },
        };
      }),
    },
  };

  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth" lang={locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "en"} className={`${inter.variable} ${display.variable} ${serif.variable}`}>
      <body>
        <a className="skip" href="#main">{d.common.skip}</a>
        <Motion />
        <Header
          locale={locale}
          nav={nav}
          bookHref={href(locale, "booking")}
          accountHref={href(locale, "account")}
          labels={{ account: d.account.nav, back: d.common.back, book: d.common.book, bookShort: d.common.bookShort, menu: d.common.menu, close: d.common.close, language: d.common.language }}
          slugIndex={slugIndex}
          phone={site.phone}
          phoneHref={site.phoneHref}
        />
        <main id="main">{children}</main>
        <AppShell
          tabs={[
            { href: `/${locale}`, label: d.nav.home, icon: "home", exact: true },
            { href: href(locale, "services"), label: d.nav.services, icon: "services" },
            { href: href(locale, "booking"), label: d.common.bookShort, icon: "book" },
            { href: href(locale, "zana"), label: d.nav.zana, icon: "zana" },
            { href: href(locale, "contact"), label: d.nav.contact, icon: "contact" },
          ]}
        />
        <Footer locale={locale} d={d} services={services.map((s) => localize(s, locale))} hours={hours} />
        <JsonLd data={business} />
      </body>
    </html>
  );
}
