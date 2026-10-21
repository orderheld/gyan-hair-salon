/** Telefon und E-Mail eines Kunden als grosse Knöpfe: Antippen startet Anruf bzw. Mail */
export function ContactLinks({ phone, email, t }: { phone: string; email: string; t: { call: string; mail: string } }) {
  const tel = phone.replace(/[^\d+]/g, "");
  if (!tel && !email) return null;
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
    </div>
  );
}
