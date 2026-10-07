"use client";

import { useEffect, useState } from "react";

type Texts = { title: string; intro: string; steps: string[]; code: string; copy: string; copied: string; note: string };

/**
 * Ohne Apple-Zertifikat: Anleitung, wie iPhone-Kunden die Karte über eine Gratis-App selber in Apple Wallet legen.
 * Nur auf iPhone/iPad sichtbar. Der Code ist derselbe Inhalt wie im QR-Code.
 */
export function IphoneWallet({ code, t }: { code: string; t: Texts }) {
  const [ios, setIos] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIos(/iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1));
  }, []);
  if (!ios) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      (document.getElementById("lc-wallet-code") as HTMLInputElement | null)?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <details className="lc-iwallet">
      <summary>
        <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M3.5 9.5h17M15 14h2.5" /></svg>
        <span>{t.title}</span>
      </summary>
      <div className="lc-iwallet-body">
        <p className="muted small">{t.intro}</p>
        <ol>{t.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        <label className="small" htmlFor="lc-wallet-code">{t.code}</label>
        <div className="lc-iwallet-code">
          <input id="lc-wallet-code" className="input" readOnly value={code} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="btn btn-light btn-sm" onClick={copy}>{copied ? t.copied : t.copy}</button>
        </div>
        <p className="muted small">{t.note}</p>
      </div>
    </details>
  );
}
