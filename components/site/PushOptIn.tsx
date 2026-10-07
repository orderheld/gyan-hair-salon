"use client";

import { useEffect, useState } from "react";
import { askPushPermission, pushPermission, subscribePush } from "@/lib/push-client";

type Texts = { title: string; text: string; button: string; active: string; iosHint: string };

/** Auf der Bestätigungsseite: Erinnerung und Dankeschön als Push aufs Handy */
export function PushOptIn({ bookingId, locale, t }: { bookingId: string; locale: string; t: Texts }) {
  const [state, setState] = useState<"idle" | "ask" | "on" | "ios" | "hidden">("idle");

  useEffect(() => {
    const perm = pushPermission();
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(navigator as { standalone?: boolean }).standalone;
    if (perm === "unsupported") return setState(ios ? "ios" : "hidden");
    if (perm === "denied") return setState("hidden");
    if (perm === "default") return setState("ask");
    subscribePush({ role: "customer", bookingId, locale }).then((ok) => setState(ok ? "on" : "hidden"));
  }, [bookingId, locale]);

  async function enable() {
    const perm = await askPushPermission();
    if (perm !== "granted") return setState("hidden");
    setState((await subscribePush({ role: "customer", bookingId, locale })) ? "on" : "hidden");
  }

  if (state === "idle" || state === "hidden") return null;
  return (
    <div className="push-card" role="status">
      <span className="push-ico" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
      </span>
      <div>
        <strong>{state === "on" ? t.active : t.title}</strong>
        <p>{state === "ios" ? t.iosHint : t.text}</p>
      </div>
      {state === "ask" && <button type="button" className="btn btn-dark btn-sm" onClick={enable}>{t.button}</button>}
    </div>
  );
}
