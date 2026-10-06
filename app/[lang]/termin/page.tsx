import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { BookingFlow } from "@/components/site/BookingFlow";
import { getServiceBySlug, getServices, localize } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";


// Immer frisch (Buchungsstatus, Auswahl aus der Adresse)
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ service?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.booking.metaTitle, description: d.booking.metaDescription, path: (l) => href(l, "booking") });
}

export default async function Booking({ params, searchParams }: Props) {
  const locale = (await params).lang as Locale;
  const { service } = await searchParams;
  const d = getDict(locale);
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  let initial = service && /^\d+$/.test(service) ? Number(service) : undefined;
  if (service && !initial) initial = (await getServiceBySlug(service))?.id;

  return (
    <section className="booking-page">
      <div className="container">
        <div className="booking-intro">
          <p className="eyebrow rise">{d.booking.eyebrow}</p>
          <h1 className="h1 rise" style={{ animationDelay: "80ms" }}>{d.booking.title}</h1>
          <p className="lead rise" style={{ animationDelay: "160ms" }}>{d.booking.lead}</p>
        </div>
        <BookingFlow
          locale={locale}
          t={d.booking}
          common={{
            from: d.common.from,
            back: d.common.back,
            next: d.common.next,
            duration: d.common.duration,
            price: d.common.price,
            weekdays: d.common.weekdays,
            weekdaysShort: d.common.weekdaysShort,
            months: d.common.months,
          }}
          services={services.map((s) => {
            const l = localize(s, locale);
            return { id: s.id, name: l.name, short: l.short, durationMin: s.durationMin, priceChf: s.priceChf, priceFrom: s.priceFrom, category: s.category, popular: s.popular };
          })}
          serviceGroups={d.services.groups}
          popularLabel={d.services.popular}
          initialServiceId={initial}
          phone={site.phone}
          phoneHref={site.phoneHref}
          owner={site.owner}
          cancelHours={settings.cancelNoticeHours}
          okHref={href(locale, "booking", "ok")}
          privacyHref={href(locale, "privacy")}
        />
      </div>
    </section>
  );
}
