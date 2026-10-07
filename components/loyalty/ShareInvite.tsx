"use client";

import { useEffect, useState } from "react";

type Texts = { share: string; copy: string; copied: string; shareText: string; title: string; whatsapp: string; sms: string; email: string; more: string; subject: string };

const ICONS = {
  whatsapp: <path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 19zM9 8.8c0 3 2.5 5.7 5.6 6.2l1.1-1.3-1.8-.9-.8.8c-1-.4-2-1.4-2.4-2.4l.8-.8-.9-1.8z" />,
  sms: <path d="M4.5 6.5h15v9.5h-8.5l-4 3.2V16h-2.5z" />,
  email: <><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M4 7l8 6 8-6" /></>,
  more: <><path d="M12 4v11M8 8l4-4 4 4" /><path d="M6 12v6.5h12V12" /></>,
};

/** Einladungslink teilen: WhatsApp, SMS, E-Mail, Teilen-Menü des Handys oder kopieren */
export function ShareInvite({ url, t }: { url: string; t: Texts }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);
  const message = `${t.shareText} ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.getElementById("lc-invite-url") as HTMLInputElement | null;
      input?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  async function share() {
    try {
      await navigator.share({ title: t.title, text: t.shareText, url });
    } catch (e) {
      if ((e as { name?: string }).name !== "AbortError") copy();
    }
  }

  const link = (key: keyof typeof ICONS, label: string, href: string) => (
    <a className="lc-share-app" href={href} target={key === "whatsapp" ? "_blank" : undefined} rel="noopener">
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ICONS[key]}</svg>
      {label}
    </a>
  );

  return (
    <div className="lc-share">
      <div className="lc-share-apps">
        {link("whatsapp", t.whatsapp, `https://wa.me/?text=${encodeURIComponent(message)}`)}
        {link("sms", t.sms, `sms:?&body=${encodeURIComponent(message)}`)}
        {link("email", t.email, `mailto:?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(message)}`)}
        {canShare && (
          <button type="button" className="lc-share-app" onClick={share}>
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ICONS.more}</svg>
            {t.more}
          </button>
        )}
      </div>
      <div className="lc-share-copy">
        <input id="lc-invite-url" className="input" readOnly value={url} aria-label={t.title} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn-light btn-sm" onClick={copy}>{copied ? `${t.copied} ✓` : t.copy}</button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{copied ? t.copied : ""}</span>
    </div>
  );
}
