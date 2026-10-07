"use client";

import { useEffect, useState } from "react";

/** Einladungslink teilen: Teilen-Menü des Handys, sonst kopieren */
export function ShareInvite({ url, t }: { url: string; t: { share: string; copy: string; copied: string; shareText: string; title: string } }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

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

  return (
    <div className="lc-share">
      <input id="lc-invite-url" className="input" readOnly value={url} aria-label={t.title} onFocus={(e) => e.currentTarget.select()} />
      <div className="lc-share-btns">
        {canShare && <button type="button" className="btn btn-dark btn-sm" onClick={share}>{t.share}</button>}
        <button type="button" className={canShare ? "btn btn-light btn-sm" : "btn btn-dark btn-sm"} onClick={copy}>{copied ? `${t.copied} ✓` : t.copy}</button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{copied ? t.copied : ""}</span>
    </div>
  );
}
