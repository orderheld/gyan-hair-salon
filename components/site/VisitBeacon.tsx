"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = "gyan_visit";

function send(data: Record<string, unknown>) {
  try {
    const body = JSON.stringify(data);
    if (!navigator.sendBeacon?.("/api/hit", new Blob([body], { type: "application/json" }))) fetch("/api/hit", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // Statistik ist nie wichtiger als die Seite
  }
}

/** Ladezeiten der ersten Seite (Core Web Vitals), gemeldet, wenn die Seite verlassen oder versteckt wird */
function watchVitals() {
  const v: { lcp?: number; cls: number; inp?: number; fcp?: number; ttfb?: number } = { cls: 0 };
  const path = location.pathname;
  const observe = (type: string, cb: (e: PerformanceEntry) => void, extra: Record<string, unknown> = {}) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(cb)).observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {
      // ältere Browser
    }
  };
  observe("largest-contentful-paint", (e) => (v.lcp = Math.round(e.startTime)));
  observe("paint", (e) => e.name === "first-contentful-paint" && (v.fcp = Math.round(e.startTime)));
  observe("layout-shift", (e) => {
    const s = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
    if (!s.hadRecentInput) v.cls += s.value;
  });
  observe("event", (e) => (v.inp = Math.max(v.inp ?? 0, Math.round(e.duration))), { durationThreshold: 16 });
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) v.ttfb = Math.round(nav.responseStart);
  let sent = false;
  const flush = () => {
    if (sent || document.visibilityState !== "hidden") return;
    sent = true;
    send({ k: "v", p: path, ...v, cls: Math.round(v.cls * 1000) / 1000 });
  };
  document.addEventListener("visibilitychange", flush);
  addEventListener("pagehide", () => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    flush();
  });
}

/** JavaScript-Fehler melden (höchstens 3 pro Seite), damit kaputte Stellen im Admin auffallen */
function watchErrors() {
  let n = 0;
  const report = (message: string, detail: string) => {
    if (++n > 3 || !message) return;
    send({ k: "e", p: location.pathname, m: message.slice(0, 300), d: detail.slice(0, 300) });
  };
  addEventListener("error", (e) => {
    if (e.target && e.target !== window) {
      const el = e.target as HTMLElement & { src?: string; href?: string };
      report(`Datei lädt nicht: <${el.tagName?.toLowerCase()}>`, el.src || el.href || "");
    } else report(e.message, `${e.filename ?? ""}:${e.lineno ?? ""}`);
  }, true);
  addEventListener("unhandledrejection", (e) => report(String((e.reason as Error)?.message ?? e.reason ?? "Promise"), ""));
}

let started = false;

/**
 * Meldet jeden Seitenaufruf an die eigene Besucherstatistik (/api/hit), dazu Ladezeiten und Fehler.
 * Kein Cookie: nur ein Zufallswert für diesen Browser-Tab (sessionStorage), damit Seiten eines Besuchs zusammengehören.
 */
export function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      if (!started) {
        started = true;
        watchVitals();
        watchErrors();
      }
      let session = sessionStorage.getItem(KEY);
      const landing = !session;
      if (!session) {
        session = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
        sessionStorage.setItem(KEY, session);
      }
      const app = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
      send({
        p: location.pathname,
        s: session,
        l: landing ? 1 : 0,
        r: landing ? document.referrer : "",
        q: landing ? location.search.slice(1) : "",
        a: app ? 1 : 0,
      });
    } catch {
      // Statistik ist nie wichtiger als die Seite
    }
  }, [pathname]);
  return null;
}

/** Auf der 404-Seite: melden, welche Adresse fehlt und woher der Link kam */
export function NotFoundBeacon() {
  useEffect(() => {
    send({ k: "404", p: location.pathname, r: document.referrer });
  }, []);
  return null;
}
