"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Ein einziger Scroll-Treiber für die ganze Seite:
 * - [data-reveal]   blendet Elemente beim Scrollen ein
 * - [data-parallax] verschiebt Bilder langsamer als die Seite (Wert = Stärke)
 * - [data-progress] setzt --p (0 → 1), während das Element durchs Bild läuft
 * - [data-words]    färbt Wort für Wort ein, während man scrollt
 * - html[data-scrolled] für Header und Buchungsknopf
 */
export function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");
    const introTimer = window.setTimeout(() => root.classList.add("no-intro"), 2000);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));

    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const progress = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
    const words = Array.from(document.querySelectorAll<HTMLElement>("[data-words]")).map((el) => ({
      el,
      spans: Array.from(el.querySelectorAll<HTMLElement>(".w")),
    }));

    let raf = 0;
    let lastScrolled = "";
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // Erst alles messen, dann schreiben: sonst erzwingt jede Zeile ein neues Layout (Ruckeln)
      const scrolled = window.scrollY > vh * 0.6 ? "2" : window.scrollY > 24 ? "1" : "0";
      const pRects = reduce ? [] : parallax.map((el) => (el.parentElement ?? el).getBoundingClientRect());
      const gRects = progress.map((el) => el.getBoundingClientRect());
      const wRects = words.map(({ el }) => el.getBoundingClientRect());

      if (scrolled !== lastScrolled) root.dataset.scrolled = lastScrolled = scrolled;
      pRects.forEach((r, i) => {
        if (r.bottom < -200 || r.top > vh + 200) return;
        const el = parallax[i];
        const speed = Number(el.dataset.parallax) || 0.15;
        const max = r.height * 0.1;
        const py = Math.max(-max, Math.min(max, (r.top + r.height / 2 - vh / 2) * -speed)).toFixed(1);
        if (el.dataset.py !== py) {
          el.dataset.py = py;
          el.style.setProperty("--py", `${py}px`);
        }
      });
      gRects.forEach((r, i) => {
        if (r.bottom < -100 || r.top > vh + 100) return;
        progress[i].style.setProperty("--p", clamp((vh - r.top) / (vh + r.height)).toFixed(3));
      });
      wRects.forEach((r, i) => {
        const { spans } = words[i];
        const p = reduce ? 1 : clamp((vh * 0.88 - r.top) / (vh * 0.5));
        const n = Math.round(p * spans.length);
        spans.forEach((s, j) => {
          if (s.classList.contains("on") !== j < n) s.classList.toggle("on", j < n);
        });
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(introTimer);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
