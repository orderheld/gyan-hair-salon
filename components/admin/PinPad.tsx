"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { posUnlock } from "@/app/admin/kasse-actions";

type Texts = { title: string; hint: string; wrong: string; back: string; del: string };

/** 6-stellige PIN wie beim Handy-Sperrbildschirm. Bei 6 Ziffern wird automatisch geprüft. */
export function PinPad({ t }: { t: Texts }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  const [pending, start] = useTransition();

  const press = useCallback((d: string) => {
    if (pending) return;
    setWrong(false);
    setPin((p) => (p.length < 6 ? p + d : p));
  }, [pending]);
  const del = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  useEffect(() => {
    if (pin.length !== 6) return;
    start(async () => {
      const ok = await posUnlock(pin);
      if (ok) router.replace("/admin/kasse");
      else {
        setWrong(true);
        setPin("");
        if (navigator.vibrate) navigator.vibrate(200);
      }
    });
  }, [pin, router]);

  // Tastatur am Computer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") del();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, del]);

  return (
    <div className="pin">
      <svg className="pin-lock" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
      <h1 className="pin-title">{t.title}</h1>
      <p className={`pin-hint${wrong ? " bad" : ""}`} role="status">{wrong ? t.wrong : t.hint}</p>
      <div className={`pin-dots${wrong ? " shake" : ""}`} aria-label={`${pin.length} / 6`}>
        {Array.from({ length: 6 }, (_, i) => <span key={i} className={i < pin.length ? "on" : ""} />)}
      </div>
      <div className="pin-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="pin-key" onClick={() => press(d)} disabled={pending}>{d}</button>
        ))}
        <Link href="/admin/start" className="pin-key pin-key-text">{t.back}</Link>
        <button type="button" className="pin-key" onClick={() => press("0")} disabled={pending}>0</button>
        <button type="button" className="pin-key pin-key-text" onClick={del} disabled={pending || !pin} aria-label={t.del}>⌫</button>
      </div>
    </div>
  );
}
