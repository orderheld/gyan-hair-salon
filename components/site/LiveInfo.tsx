"use client";

import { useEffect, useState } from "react";

type Live = { status: string | null; isOpen: boolean; slot: string };

// Eine Anfrage pro Seitenaufruf, auch wenn mehrere Teile die Angaben brauchen
let pending: Promise<Live | null> | null = null;
let pendingLocale = "";
function loadLive(locale: string) {
  if (!pending || pendingLocale !== locale) {
    pendingLocale = locale;
    pending = fetch(`/api/live?l=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Live>) : null))
      .catch(() => null);
    setTimeout(() => (pending = null), 60_000);
  }
  return pending;
}

function useLive(locale: string) {
  const [live, setLive] = useState<Live | null>(null);
  useEffect(() => {
    let alive = true;
    loadLive(locale).then((v) => alive && setLive(v));
    return () => {
      alive = false;
    };
  }, [locale]);
  return live;
}

/** «Jetzt offen · bis 19:00», erscheint sanft, sobald die Angabe da ist. Der Platz ist reserviert, damit nichts springt. */
export function LiveChip({ locale }: { locale: string }) {
  const live = useLive(locale);
  return (
    <span className="live-chip-slot">
      {live?.status && (
        <span className={`live-chip live-fade${live.isOpen ? " is-open" : ""}`}>
          <i aria-hidden />
          {live.status}
        </span>
      )}
    </span>
  );
}

/** Nächster freier Termin; bis die Angabe da ist, steht der neutrale Text */
export function LiveSlot({ locale, fallback }: { locale: string; fallback: string }) {
  const live = useLive(locale);
  return <strong className={live ? "live-fade" : undefined}>{live?.slot ?? fallback}</strong>;
}
