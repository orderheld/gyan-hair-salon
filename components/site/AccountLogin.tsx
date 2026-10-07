"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fill } from "@/lib/i18n/fill";

type Texts = {
  loginLead: string;
  email: string;
  sendCode: string;
  sending: string;
  codeTitle: string;
  codeText: string;
  codeLabel: string;
  login: string;
  checking: string;
  resend: string;
  resendIn: string;
  sent: string;
  change: string;
};

/** Anmelden für «Meine Termine»: E-Mail, dann 6-stelliger Code. Kein Passwort. */
export function AccountLogin({ locale, t }: { locale: string; t: Texts }) {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (resendAt <= now) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [resendAt, now]);
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  async function post(payload: Record<string, unknown>) {
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, email, ...payload }),
    });
    return { status: res.status, data: (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: boolean; resendIn?: number; seconds?: number; error?: string } };
  }

  async function requestCode(again = false) {
    setBusy(true);
    setError(null);
    setInfo(null);
    const { data } = await post({ step: "code" });
    setBusy(false);
    if (data.ok) return router.refresh();
    if (data.sent) {
      setStage("code");
      setCode("");
      setResendAt(Date.now() + (data.resendIn ?? 30) * 1000);
      setNow(Date.now());
      if (again) setInfo(t.sent);
      return;
    }
    if (data.seconds) {
      setResendAt(Date.now() + data.seconds * 1000);
      setNow(Date.now());
    }
    setError(data.error ?? "Error");
  }

  async function login(value: string) {
    setBusy(true);
    setError(null);
    const { data } = await post({ step: "login", code: value });
    if (data.ok) return router.refresh();
    setBusy(false);
    setCode("");
    setError(data.error ?? "Error");
  }

  const alerts = (
    <>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {info && !error && <div className="alert alert-ok" role="status">{info}</div>}
    </>
  );

  if (stage === "email") {
    return (
      <form
        className="account-login"
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
      >
        <p className="muted">{t.loginLead}</p>
        {alerts}
        <div className="field">
          <label htmlFor="acc-email">{t.email}</label>
          <input id="acc-email" type="email" className="input" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? t.sending : t.sendCode}</button>
      </form>
    );
  }

  return (
    <form
      className="verify account-login"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) login(code);
      }}
    >
      <span className="verify-icon" aria-hidden>
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="11" width="36" height="26" rx="4" />
          <path d="M7 13l17 13 17-13" />
        </svg>
      </span>
      <h2 className="h3">{t.codeTitle}</h2>
      <p className="muted">{fill(t.codeText, { email })}</p>
      {alerts}
      <label className="verify-label" htmlFor="acc-code">{t.codeLabel}</label>
      <input
        id="acc-code"
        className="code-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        autoFocus
        value={code}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
          setCode(v);
          if (v.length === 6 && !busy) login(v);
        }}
      />
      <button type="submit" className="btn btn-dark verify-submit" disabled={code.length !== 6 || busy}>
        {busy ? t.checking : t.login}
      </button>
      <div className="verify-links">
        <button type="button" className="link-btn" disabled={resendIn > 0 || busy} onClick={() => requestCode(true)}>
          {resendIn > 0 ? fill(t.resendIn, { s: resendIn }) : t.resend}
        </button>
        <button type="button" className="link-btn" onClick={() => { setStage("email"); setError(null); setInfo(null); }}>
          {t.change}
        </button>
      </div>
    </form>
  );
}

/** Abmelden-Knopf */
export function AccountLogout({ label }: { label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="link-btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/account", { method: "DELETE" }).catch(() => null);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
