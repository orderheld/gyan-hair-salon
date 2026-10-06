"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

type Item = { src: string; alt: string; caption: string };

/**
 * Arbeiten als Filmstreifen. Desktop: läuft beim Scrollen horizontal durch (Sticky).
 * Mobile: natives Wischen mit Einrasten.
 */
export function Filmstrip({ items, head }: { items: Item[]; head: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    let extra = 0;
    let raf = 0;

    const measure = () => {
      if (!mq.matches) {
        sec.style.height = "";
        tr.style.transform = "";
        return;
      }
      extra = Math.max(0, tr.scrollWidth - window.innerWidth);
      sec.style.height = `${window.innerHeight + extra}px`;
      update();
    };
    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, extra)));
      tr.style.transform = `translate3d(${-p * extra}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} className="film">
      <div className="film-sticky">
        <div className="container film-head">{head}</div>
        <div ref={track} className="film-track">
          {items.map((it, i) => (
            <figure key={it.src + i} className="film-item">
              <div className="film-img">
                <Image src={it.src} alt={it.alt} fill sizes="(max-width: 900px) 78vw, 30vw" />
              </div>
              <figcaption>
                <span className="film-no">{String(i + 1).padStart(2, "0")}</span>
                {it.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
