import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <section className="section-tight">
      <div className="container narrow prose">
        <h1 className="h1">Impressum</h1>
        <p className="note">Platzhalter: Bitte rechtliche Angaben (Inhaber, Rechtsform, UID) vor dem Livegang prüfen und ergänzen.</p>
        <h2>Kontakt</h2>
        <p>
          {site.name}<br />
          Inhaber: {site.owner} [Nachname]<br />
          {site.address.street}<br />
          {site.address.zip} {site.address.city}<br />
          Schweiz
        </p>
        <p>
          Telefon: <a className="link" href={site.phoneHref}>{site.phone}</a><br />
          E-Mail: <a className="link" href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <h2>Unternehmens-Identifikationsnummer</h2>
        <p>[UID, falls vorhanden]</p>
        <h2>Haftungsausschluss</h2>
        <p>
          Wir prüfen die Inhalte dieser Webseite sorgfältig, übernehmen aber keine Gewähr für Richtigkeit, Vollständigkeit
          und Aktualität. Preise und Öffnungszeiten können sich ändern.
        </p>
        <h2>Webdesign</h2>
        <p>[Agentur / Ersteller]</p>
      </div>
    </section>
  );
}
