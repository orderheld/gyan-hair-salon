"use client";

import { useEffect, useState } from "react";

type Msg = { id: number; kind: "ok" | "error"; text: string };
const EVENT = "gyan-toast";

/** Von überall aufrufbar: zeigt oben eine gut sichtbare Bestätigung oder Fehlermeldung */
export function toast(text: string, kind: "ok" | "error" = "ok") {
  if (typeof window !== "undefined" && text) window.dispatchEvent(new CustomEvent<Omit<Msg, "id">>(EVENT, { detail: { kind, text } }));
}

/** Einmal pro Layout: zeigt Meldungen schwebend, Erfolg verschwindet nach ein paar Sekunden, Fehler bleiben bis «Schliessen» */
export function Toaster({ closeLabel = "Schliessen" }: { closeLabel?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  useEffect(() => {
    let n = 0;
    const on = (e: Event) => {
      const d = (e as CustomEvent<Omit<Msg, "id">>).detail;
      const id = ++n;
      setMsgs((m) => [...m.filter((x) => x.text !== d.text).slice(-2), { ...d, id }]);
      if (d.kind === "ok") window.setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 3800);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  if (!msgs.length) return null;
  return (
    <div className="toasts" aria-live="polite">
      {msgs.map((m) => (
        <div key={m.id} className={`toast toast-${m.kind}`} role={m.kind === "error" ? "alert" : "status"}>
          <span className="toast-ico" aria-hidden>
            {m.kind === "ok" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 7v6M12 16.5v.5" /></svg>
            )}
          </span>
          <span className="toast-text">{m.text}</span>
          <button type="button" className="toast-x" aria-label={closeLabel} onClick={() => setMsgs((x) => x.filter((y) => y.id !== m.id))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 7l10 10M17 7L7 17" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
