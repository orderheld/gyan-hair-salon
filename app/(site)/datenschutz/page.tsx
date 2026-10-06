import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <section className="section-tight">
      <div className="container narrow prose">
        <h1 className="h1">Datenschutz</h1>
        <p className="note">Vorlage nach dem Schweizer Datenschutzgesetz (DSG). Bitte vor dem Livegang prüfen lassen.</p>
        <h2>Verantwortlich</h2>
        <p>{site.name}, {site.owner} [Nachname], {site.address.street}, {site.address.zip} {site.address.city}, {site.email}</p>
        <h2>Welche Daten wir bearbeiten</h2>
        <p>
          Wenn du online einen Termin buchst, bearbeiten wir Name, E-Mail-Adresse, Telefonnummer, gewählte Leistung,
          Termin und eine allfällige Notiz. Wir verwenden diese Daten ausschliesslich, um deinen Termin durchzuführen,
          dich zu informieren und bei Bedarf mit dir Kontakt aufzunehmen.
        </p>
        <h2>Dienstleister</h2>
        <ul>
          <li>Hosting: Vercel Inc. (Server in der EU bzw. USA)</li>
          <li>Datenbank: Neon Inc. (Region Frankfurt, EU)</li>
          <li>E-Mail-Versand: Resend Inc.</li>
        </ul>
        <p>
          Mit diesen Anbietern bestehen Verträge zur Auftragsbearbeitung. Eine Bekanntgabe ins Ausland erfolgt nur
          mit angemessenen Garantien (z. B. Standardvertragsklauseln).
        </p>
        <h2>Aufbewahrung</h2>
        <p>Termindaten löschen wir spätestens 24 Monate nach dem Termin, sofern keine gesetzliche Pflicht zur Aufbewahrung besteht.</p>
        <h2>Cookies</h2>
        <p>Diese Webseite verwendet keine Tracking- oder Werbe-Cookies.</p>
        <h2>Deine Rechte</h2>
        <p>Du kannst jederzeit Auskunft, Berichtigung oder Löschung deiner Daten verlangen. Schreib uns an {site.email}.</p>
      </div>
    </section>
  );
}
