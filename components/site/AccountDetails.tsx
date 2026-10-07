"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Texts = { details: string; detailsHint: string; detailsSave: string; detailsSaving: string; detailsSaved: string; emailFixed: string; name: string; phone: string; birthDate: string };

/** «Meine Angaben»: Name, Telefon, Geburtsdatum fürs ganze Konto ändern. Die E-Mail bleibt fix. */
export function AccountDetails({ locale, t, email, initial }: { locale: string; t: Texts; email: string; initial: { name: string; phone: string; birthDate: string } }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, locale }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "Error" });
      else {
        setMsg({ ok: true, text: t.detailsSaved });
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="account-details" onSubmit={save}>
      <p className="muted small">{t.detailsHint}</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="acc-name">{t.name}</label>
          <input id="acc-name" className="input" required minLength={2} maxLength={80} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="acc-email">{t.emailFixed}</label>
          <input id="acc-email" className="input" type="email" value={email} readOnly />
        </div>
        <div className="field">
          <label htmlFor="acc-phone">{t.phone}</label>
          <input id="acc-phone" className="input" type="tel" required autoComplete="tel" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="acc-birth">{t.birthDate}</label>
          <input id="acc-birth" className="input" type="date" required min="1900-01-01" max={today} autoComplete="bday" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
        </div>
      </div>
      {msg && <div className={`alert ${msg.ok ? "alert-ok" : "alert-error"}`} role="status">{msg.text}</div>}
      <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? t.detailsSaving : t.detailsSave}</button>
    </form>
  );
}
