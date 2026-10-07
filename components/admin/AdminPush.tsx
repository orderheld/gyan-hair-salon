"use client";

import { useEffect, useState } from "react";
import { askPushPermission, pushPermission, registerWorker, subscribePush } from "@/lib/push-client";

type Texts = { title: string; text: string; button: string; denied: string; later: string };

/** Admin: Push für neue Buchungen. Ist die Erlaubnis da, wird das Gerät still angemeldet. */
export function AdminPush({ t, enabled }: { t: Texts; enabled: boolean }) {
  const [state, setState] = useState<"idle" | "ask" | "denied" | "done">("idle");

  useEffect(() => {
    if (!enabled) return;
    if ("serviceWorker" in navigator) registerWorker(true).catch(() => {});
    const perm = pushPermission();
    let snoozed = false;
    try {
      snoozed = Number(localStorage.getItem("gyan-push-later") ?? 0) > Date.now();
    } catch {}
    if (perm === "granted") {
      subscribePush({ role: "admin" }).then(() => setState("done"));
    } else if (perm === "default" && !snoozed) setState("ask");
    else if (perm === "denied" && !snoozed) setState("denied");
  }, [enabled]);

  async function enable() {
    const perm = await askPushPermission();
    if (perm === "granted") {
      await subscribePush({ role: "admin" });
      setState("done");
    } else setState(perm === "denied" ? "denied" : "ask");
  }

  function later() {
    try {
      localStorage.setItem("gyan-push-later", String(Date.now() + 3 * 864e5));
    } catch {}
    setState("done");
  }

  if (state !== "ask" && state !== "denied") return null;
  return (
    <div className="admin-push" role="status">
      <span className="push-ico" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
      </span>
      <div>
        <strong>{t.title}</strong>
        <p>{state === "denied" ? t.denied : t.text}</p>
      </div>
      <div className="admin-push-btns">
        {state === "ask" && <button type="button" className="btn btn-dark btn-sm" onClick={enable}>{t.button}</button>}
        <button type="button" className="btn btn-light btn-sm" onClick={later}>{t.later}</button>
      </div>
    </div>
  );
}
