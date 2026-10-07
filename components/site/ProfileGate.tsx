import type { Locale } from "@/content/types";
import { AccountDetails } from "@/components/site/AccountDetails";
import { AccountLogout } from "@/components/site/AccountLogin";
import type { AccountProfile } from "@/lib/customers";
import type { Dict } from "@/lib/i18n";

/** Nach dem ersten Anmelden: Name, Telefon und Geburtsdatum einmalig ergänzen, erst dann geht es weiter */
export function ProfileGate({ locale, d, email, profile }: { locale: Locale; d: Dict; email: string; profile: AccountProfile }) {
  const t = d.account;
  return (
    <section className="booking-page">
      <div className="container">
        <div className="confirm-card account-card">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="h2">{t.completeTitle}</h1>
          <p className="muted">{t.completeHint}</p>
          <AccountDetails
            locale={locale}
            email={email}
            t={{ details: t.details, detailsHint: "", detailsSave: t.completeSave, detailsSaving: t.detailsSaving, detailsSaved: t.detailsSaved, emailFixed: t.emailFixed, name: d.booking.name, phone: d.booking.phone, birthDate: d.booking.birthDate }}
            initial={profile}
          />
          {/* Wer nicht weitermachen will: abmelden und zurück zur Startseite */}
          <p className="gate-cancel">
            <AccountLogout label={t.completeCancel} to={`/${locale}`} />
            <span className="muted small">{t.completeCancelHint}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
