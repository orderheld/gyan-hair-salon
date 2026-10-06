import type { Metadata } from "next";
import { BookingFlow } from "@/components/BookingFlow";
import { site } from "@/content/site";
import { getServices } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Termin buchen",
  description: "Termin bei Zana im GYAN Hair Salon Biel online buchen. Sofort bestätigt.",
};

export default async function TerminPage({ searchParams }: { searchParams: Promise<{ leistung?: string }> }) {
  const { leistung } = await searchParams;
  const services = await getServices();
  return (
    <section className="booking-page">
      <div className="container">
        <header className="booking-intro">
          <p className="eyebrow">Termin buchen</p>
          <h1 className="h1">Deine Zeit bei Zana.</h1>
          <p className="lead">
            Online buchbar sind Termine beim Inhaber Zana. Ist die Zeit frei, ist sie sofort bestätigt.
            Für unser übriges Team kommst du einfach ohne Voranmeldung vorbei.
          </p>
        </header>
        <BookingFlow
          services={services.map(({ id, name, description, durationMin, priceChf, priceFrom }) => ({
            id, name, description, durationMin, priceChf, priceFrom,
          }))}
          initialServiceId={leistung ? Number(leistung) : undefined}
          phone={site.phone}
          phoneHref={site.phoneHref}
        />
      </div>
    </section>
  );
}
