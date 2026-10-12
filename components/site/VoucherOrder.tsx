"use client";

import { useState } from "react";
import type { Locale } from "@/content/types";
import type { Dict } from "@/lib/i18n/dict/de";
import { fill } from "@/lib/i18n/fill";

type Props = {
  locale: Locale;
  t: Dict["voucher"]["form"];
  presets: number[];
  min: number;
  max: number;
  privacyHref: string;
  address: string;
};

/** Gutschein online bestellen: Betrag wählen, Angaben, reservieren. Bezahlt wird beim Abholen im Salon. */
export function VoucherOrder({ locale, t, presets, min, max, privacyHref, address }: Props) {
  const first = presets.includes(50) ? 50 : (presets[0] ?? min);
  const [preset, setPreset] = useState<number | "other">(presets.length ? first : "other");
  const [other, setOther] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", recipientName: "", message: "", website: "", consent: false });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; amount: number; email: string } | null>(null);

  const amount = preset === "other" ? Number(other.replace(",", ".")) : preset;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!Number.isInteger(amount) || amount < min || amount > max) {
      setError(fill(t.errors.amount, { min, max }));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || t.errors.generic);
      } else {
        setDone({ code: data.code, amount: data.amount, email: form.email });
      }
    } catch {
      setError(t.errors.generic);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="vc-order vc-done" role="status">
        <span className="vc-done-icon" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="24" r="18" /><path d="m16 24.5 5.5 5.5L32.5 19" /></svg>
        </span>
        <h3 className="h3">{t.doneTitle}</h3>
        <p className="muted">{fill(t.doneText, { email: done.email })}</p>
        <dl className="vc-done-facts">
          <div><dt>{t.doneCode}</dt><dd className="vc-code">{done.code}</dd></div>
          <div><dt>{t.doneAmount}</dt><dd>CHF {done.amount}</dd></div>
          <div><dt>{t.doneWhere}</dt><dd>{address}</dd></div>
        </dl>
        <button type="button" className="btn btn-light" onClick={() => { setDone(null); setForm({ ...form, recipientName: "", message: "" }); }}>{t.another}</button>
      </div>
    );
  }

  return (
    <form className="vc-order" onSubmit={submit} noValidate={false}>
      <fieldset className="vc-amounts">
        <legend>{t.amount}</legend>
        <div className="vc-chips">
          {presets.map((p) => (
            <button key={p} type="button" className={`vc-chip${preset === p ? " is-on" : ""}`} aria-pressed={preset === p} onClick={() => setPreset(p)}>
              CHF {p}
            </button>
          ))}
          <button type="button" className={`vc-chip${preset === "other" ? " is-on" : ""}`} aria-pressed={preset === "other"} onClick={() => setPreset("other")}>
            {t.other}
          </button>
        </div>
        {preset === "other" && (
          <div className="field vc-other">
            <label htmlFor="vc-other">{t.other} (CHF)</label>
            <input id="vc-other" className="input" type="number" inputMode="numeric" min={min} max={max} step={1} required autoFocus value={other} onChange={(e) => setOther(e.target.value)} />
            <small className="field-hint">{fill(t.otherHint, { min, max })}</small>
          </div>
        )}
      </fieldset>

      <div className="form-grid vc-form-grid">
        <div className="field">
          <label htmlFor="vc-name">{t.name}</label>
          <input id="vc-name" className="input" required minLength={2} autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="field">
          <label htmlFor="vc-phone">{t.phone}</label>
          <input id="vc-phone" type="tel" className="input" required autoComplete="tel" placeholder="079 123 45 67" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="field full">
          <label htmlFor="vc-email">{t.email}</label>
          <input id="vc-email" type="email" className="input" required autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="field full">
          <label htmlFor="vc-recipient">{t.recipient} <span className="muted">({t.optional})</span></label>
          <input id="vc-recipient" className="input" maxLength={60} value={form.recipientName} onChange={set("recipientName")} />
          <small className="field-hint">{t.recipientHint}</small>
        </div>
        <div className="field full">
          <label htmlFor="vc-message">{t.message} <span className="muted">({t.optional})</span></label>
          <textarea id="vc-message" className="textarea" rows={2} maxLength={300} value={form.message} onChange={set("message")} />
        </div>
        <div className="hp" aria-hidden>
          <label htmlFor="vc-website">Website</label>
          <input id="vc-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </div>
      </div>

      <label className="consent">
        <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
        <span>
          {t.consent.split("{privacy}")[0]}
          <a className="link" href={privacyHref} target="_blank" rel="noopener">{t.privacy}</a>
          {t.consent.split("{privacy}")[1]}
        </span>
      </label>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="vc-submit">
        <button type="submit" className="btn btn-dark" disabled={sending}>
          {sending ? t.sending : Number.isFinite(amount) && amount > 0 ? `${t.submit} · CHF ${amount}` : t.submit}
        </button>
        <p className="muted small">{t.payNote}</p>
      </div>
    </form>
  );
}
