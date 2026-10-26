import { fill } from "@/lib/i18n";
import { birthInfo } from "@/lib/time";

type Texts = { call: string; mail: string };
type BirthTexts = { birthDate: string; age: string; birthday: string; noBirthDate: string };

/** Telefon und E-Mail eines Kunden als grosse Knöpfe: Antippen startet Anruf bzw. Mail. Optional mit Geburtsdatum und Alter. */
export function ContactLinks({ phone, email, t, birthDate, tb }: { phone: string; email: string; t: Texts; birthDate?: string; tb?: BirthTexts }) {
  const tel = phone.replace(/[^\d+]/g, "");
  const birth = tb && birthDate !== undefined ? birthInfo(birthDate) : null;
  if (!tel && !email && !tb) return null;
  return (
    <div className="lc-contact">
      {tel && (
        <a className="lc-contact-btn" href={`tel:${tel}`} aria-label={`${t.call}: ${phone}`}>
          <svg viewBox="0 0 24 24" aria-hidden><path d="M6.6 3.5h2.6l1.4 4.2-2 1.4a12 12 0 0 0 6.3 6.3l1.4-2 4.2 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" /></svg>
          <span><small>{t.call}</small>{phone}</span>
        </a>
      )}
      {email && (
        <a className="lc-contact-btn" href={`mailto:${email}`} aria-label={`${t.mail}: ${email}`}>
          <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
          <span><small>{t.mail}</small>{email}</span>
        </a>
      )}
      {tb && (
        <div className={`lc-contact-btn lc-birth${birth?.birthday ? " is-today" : ""}${birth ? "" : " is-missing"}`}>
          <svg viewBox="0 0 24 24" aria-hidden><path d="M4 20h16M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 15.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0M12 11V8m0-2.5c-.8-.8-.8-1.7 0-2.5.8.8.8 1.7 0 2.5Z" /></svg>
          <span>
            <small>{birth?.birthday ? tb.birthday : tb.birthDate}</small>
            {birth ? `${birth.label} · ${fill(tb.age, { n: birth.age })}` : tb.noBirthDate}
          </span>
        </div>
      )}
    </div>
  );
}
