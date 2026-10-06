"use client";

import { useRef } from "react";

type Props = {
  name: string;
  defaultValue?: number;
  step: number;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  decimal?: boolean;
  labels: { less: string; more: string };
  id?: string;
};

/** Grosses Zahlenfeld mit − und + (fürs Handy): Preis und Dauer ohne Tastatur anpassen */
export function Stepper({ name, defaultValue, step, min, max, prefix, suffix, decimal, labels, id }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const bump = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const now = Number(String(el.value).replace(",", ".")) || 0;
    const next = Math.min(max, Math.max(min, Math.round((now + dir * step) / step) * step));
    el.value = String(next);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  return (
    <div className="stepper">
      <button type="button" className="stepper-btn" onClick={() => bump(-1)} aria-label={`${labels.less} (−${step})`}>
        <svg viewBox="0 0 24 24" aria-hidden><path d="M6 12h12" /></svg>
      </button>
      <label className="stepper-field">
        <span className="stepper-affix">{prefix}</span>
        <input
          ref={ref}
          id={id}
          name={name}
          defaultValue={defaultValue}
          inputMode={decimal ? "decimal" : "numeric"}
          pattern={decimal ? "[0-9]+([.,][0-9]{1,2})?" : "[0-9]*"}
          required
          className="stepper-input"
          autoComplete="off"
        />
        <span className="stepper-affix">{suffix}</span>
      </label>
      <button type="button" className="stepper-btn" onClick={() => bump(1)} aria-label={`${labels.more} (+${step})`}>
        <svg viewBox="0 0 24 24" aria-hidden><path d="M6 12h12M12 6v12" /></svg>
      </button>
    </div>
  );
}

/** Markiert das Formular als geändert, damit «Nicht gespeichert» und der Speichern-Knopf auffallen */
export function DirtyWatch() {
  return (
    <span
      hidden
      ref={(el) => {
        const form = el?.closest("form");
        if (!form || form.dataset.watch) return;
        form.dataset.watch = "1";
        const mark = () => (form.dataset.dirty = "1");
        form.addEventListener("input", mark);
        form.addEventListener("change", mark);
      }}
    />
  );
}
