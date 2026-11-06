"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const AWAY_MS = 30_000;
const SKIP = /^\/admin\/(start|login|pin)(\/|$)/;
const REFRESH_MS = 60_000;
// Seiten mit Terminlisten, die sich von selbst aktualisieren
const LIVE = /^\/admin(\/kalender)?\/?$/;
// Nicht neu laden, während jemand tippt oder «Termin eintragen» offen hat
const editing = () => {
  const a = document.activeElement;
  return !!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || !!document.querySelector("details.bk-new[open]");
};

/**
 * Admin verlassen und wieder öffnen: immer zurück zur Startauswahl (Termine, Kasse, Stempelkarte).
 * Kurzes Wegwechseln (unter 30 s, z. B. Kamera-Erlaubnis) bleibt auf der Seite.
 */
export function AdminResume() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    // Ältere Home-Bildschirm-Apps starten noch bei /admin statt bei der Startauswahl
    try {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
      if (standalone && !sessionStorage.getItem("gyan-admin-run")) {
        sessionStorage.setItem("gyan-admin-run", "1");
        if (location.pathname === "/admin" && !location.search) router.replace("/admin/start");
      }
    } catch {}
  }, [router]);

  useEffect(() => {
    let hiddenAt = 0;
    let hiddenUrl = "";
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        hiddenUrl = location.href;
        return;
      }
      const away = hiddenAt && Date.now() - hiddenAt > AWAY_MS;
      // Hat eine Mitteilung inzwischen eine andere Seite geöffnet, bleibt diese stehen
      if (away && location.href === hiddenUrl && !SKIP.test(location.pathname)) router.replace("/admin/start");
      // Kurz weg: Liste trotzdem neu laden, damit neue Buchungen sofort sichtbar sind
      else if (hiddenAt && LIVE.test(location.pathname) && !editing()) router.refresh();
      hiddenAt = 0;
    };
    document.addEventListener("visibilitychange", onVis);
    // Termine und Kalender bleiben offen liegen (iPad am Empfang): jede Minute frisch laden
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && LIVE.test(location.pathname) && !editing()) router.refresh();
    }, REFRESH_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(timer);
    };
  }, [router, pathname]);

  return null;
}
