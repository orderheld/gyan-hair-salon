"use client";

import { useEffect, useRef } from "react";
import { Scissors } from "./Scissors";

/**
 * Der rote Faden: zieht sich beim Scrollen durch die ganze Startseite,
 * eine kleine Schere führt ihn an der Spitze. Liegt hinter dem Inhalt.
 * Muss in einem Element mit position: relative stehen.
 */
export function RedThread() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = svg.current?.parentElement;
    const p = path.current;
    const s = svg.current;
    if (!el || !p || !s) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let len = 0;
    let raf = 0;

    const build = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      s.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const mobile = w < 760;
      const left = w * (mobile ? 0.035 : 0.06);
      const right = w * (mobile ? 0.965 : 0.94);
      const step = mobile ? 620 : 900;
      let d = `M ${w / 2} 0`;
      let y = 0;
      let x = w / 2;
      let toRight = true;
      while (y < h) {
        const ny = Math.min(h, y + step);
        const nx = ny >= h ? w / 2 : toRight ? right : left;
        const k = (ny - y) * 0.55;
        d += ` C ${x} ${y + k}, ${nx} ${ny - k}, ${nx} ${ny}`;
        x = nx;
        y = ny;
        toRight = !toRight;
      }
      p.setAttribute("d", d);
      len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      update();
    };

    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
      const at = len * progress;
      p.style.strokeDashoffset = `${len - at}`;
      if (tip.current) {
        const a = p.getPointAtLength(Math.max(0, at - 2));
        const b = p.getPointAtLength(at);
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        tip.current.style.transform = `translate(${b.x}px, ${b.y}px) translate(-50%, -50%) rotate(${angle + 180}deg)`;
        tip.current.style.opacity = progress > 0.002 && progress < 0.998 ? "1" : "0";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <svg ref={svg} className="thread" aria-hidden preserveAspectRatio="none">
        <path ref={path} d="M0 0" />
      </svg>
      <div ref={tip} className="thread-tip" aria-hidden>
        <Scissors />
      </div>
    </>
  );
}
