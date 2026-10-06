"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { formatChf, formatDuration } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict/de";
import { fill } from "@/lib/i18n/fill";

type Service = { id: number; name: string; short: string; durationMin: number; priceChf: number; priceFrom: boolean };
type Props = {
  locale: Locale;
  t: Dict["booking"];
  common: Pick<Dict["common"], "from" | "back" | "next" | "duration" | "price" | "weekdays" | "weekdaysShort" | "months">;
  services: Service[];
  initialServiceId?: number;
  phone: string;
  phoneHref: string;
  owner: string;
  cancelHours: number;
  okHref: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function BookingFlow({ locale, t, common, services, initialServiceId, phone, phoneHref, owner, cancelHours, okHref }: Props) {
  const router = useRouter();
  const MONTHS = common.months;
  const DAYS_SHORT = [1, 2, 3, 4, 5, 6, 0].map((i) => common.weekdaysShort[i]);
  const longDate = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return new Intl.DateTimeFormat(locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(date);
  };
  const initial = services.find((s) => s.id === initialServiceId) ?? null;
  const [service, setService] = useState<Service | null>(initial);
  const [step, setStep] = useState<1 | 2 | 3>(initial ? 2 : 1);
  const [days, setDays] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAvailability(s: Service, keepSelection = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?service=${s.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDays(data.days);
      const first = Object.keys(data.days).sort()[0];
      if (!keepSelection) {
        setDate(first ?? null);
        setTime(null);
        if (first) {
          const [y, m] = first.split("-").map(Number);
          setMonth({ y, m: m - 1 });
        }
      }
    } catch {
      setError(t.errors.load);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (service) loadAvailability(service);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  const available = useMemo(() => new Set(Object.keys(days ?? {})), [days]);
  const bounds = useMemo(() => {
    const keys = [...available].sort();
    return keys.length ? { first: keys[0], last: keys[keys.length - 1] } : null;
  }, [available]);

  // Bei jedem Schritt an den Anfang der Buchung springen (sonst landet man im Footer)
  const rootRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    const el = rootRef.current;
    if (!el) return;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - header - 16), behavior: "smooth" });
  }, [step]);

  /** Sanft zum nächsten Bedienelement scrollen, nur wenn es nicht schon sichtbar ist */
  const reveal = (selector: string) =>
    requestAnimationFrame(() => rootRef.current?.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));

  function chooseService(s: Service) {
    setService(s);
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, date, time, locale, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.errors.generic);
        if (res.status === 409) {
          setTime(null);
          setStep(2);
          loadAvailability(service, true);
        }
        return;
      }
      router.push(`${okHref}?id=${data.id}`);
    } catch {
      setError(t.errors.network);
    } finally {
      setSubmitting(false);
    }
  }

  // Kalender
  const cal = month && (() => {
    const first = new Date(Date.UTC(month.y, month.m, 1, 12));
    const lead = (first.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(month.y, month.m + 1, 0, 12)).getUTCDate();
    const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    return cells;
  })();
  const monthKey = month ? `${month.y}-${pad(month.m + 1)}` : "";
  const canPrev = bounds && month ? bounds.first.slice(0, 7) < monthKey : false;
  const canNext = bounds && month ? bounds.last.slice(0, 7) > monthKey : false;
  const shiftMonth = (delta: number) =>
    setMonth((m) => (m ? { y: m.y + Math.floor((m.m + delta) / 12), m: (m.m + delta + 12) % 12 } : m));

  const slots = date && days ? days[date] ?? [] : [];
  const groups = [
    { label: t.morning, items: slots.filter((t) => t < "12:00") },
    { label: t.afternoon, items: slots.filter((t) => t >= "12:00" && t < "17:00") },
    { label: t.evening, items: slots.filter((t) => t >= "17:00") },
  ].filter((g) => g.items.length);

  return (
    <div className="booking" ref={rootRef}>
      <ol className="steps" aria-label={t.eyebrow}>
        {t.steps.map((label, i) => (
          <li key={label} className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}>
            <button type="button" disabled={i + 1 > step} onClick={() => setStep((i + 1) as 1 | 2 | 3)}>
              <span className="dot">{i + 1}</span>
              <span className="step-lbl">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="booking-grid">
        <div className="booking-main">
          {error && <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>{error}</div>}

          {step === 1 && (
            <div className="service-list">
              {services.map((s) => (
                <button key={s.id} type="button" className={`service-option ${service?.id === s.id ? "selected" : ""}`} onClick={() => chooseService(s)}>
                  <span>
                    <strong>{s.name}</strong>
                    {s.short && <span className="desc">{s.short}</span>}
                  </span>
                  <span className="meta">
                    <span className="price">{s.priceFrom ? `${common.from} ` : ""}{formatChf(s.priceChf)}</span>
                    <span className="duration">{formatDuration(s.durationMin, locale)}</span>
                  </span>
                </button>
              ))}
              {services.length === 0 && <p className="muted">{t.noServices}</p>}
            </div>
          )}

          {step === 2 && service && (
            <div className="picker">
              {loading && !days && <p className="muted">{t.loading}</p>}
              {days && available.size === 0 && (
                <div className="empty">
                  <h3 className="h3">{t.noSlotsTitle}</h3>
                  <p className="muted">{t.noSlotsText} <a className="link" href={phoneHref}>{phone}</a></p>
                </div>
              )}
              {days && available.size > 0 && month && cal && (
                <>
                  <div className="calendar">
                    <div className="cal-head">
                      <button type="button" className="cal-nav" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label={t.prevMonth}>‹</button>
                      <span>{MONTHS[month.m]} {month.y}</span>
                      <button type="button" className="cal-nav" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label={t.nextMonth}>›</button>
                    </div>
                    <div className="cal-grid">
                      {DAYS_SHORT.map((d) => <span key={d} className="cal-dow">{d}</span>)}
                      {cal.map((d, i) => {
                        if (!d) return <span key={`e${i}`} />;
                        const k = keyOf(month.y, month.m, d);
                        const open = available.has(k);
                        return (
                          <button
                            key={k}
                            type="button"
                            className={`cal-day ${date === k ? "selected" : ""}`}
                            disabled={!open}
                            onClick={() => { setDate(k); setTime(null); reveal(".times"); }}
                            aria-label={longDate(k)}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="times">
                    {date && <h3 className="h3" style={{ fontSize: 18 }}>{longDate(date)}</h3>}
                    {groups.map((g) => (
                      <div key={g.label} className="time-group">
                        <span className="time-label">{g.label}</span>
                        <div className="time-grid">
                          {g.items.map((t) => (
                            <button key={t} type="button" className={`time ${time === t ? "selected" : ""}`} onClick={() => { setTime(t); reveal(".picker > .step-actions"); }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="step-actions">
                <button type="button" className="btn btn-light" onClick={() => setStep(1)}>{common.back}</button>
                <button type="button" className="btn btn-dark" disabled={!date || !time} onClick={() => setStep(3)}>{common.next}</button>
              </div>
            </div>
          )}

          {step === 3 && service && date && time && (
            <form className="details" onSubmit={submit}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="name">{t.name}</label>
                  <input id="name" className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="email">{t.email}</label>
                  <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="phone">{t.phone}</label>
                  <input id="phone" type="tel" className="input" required autoComplete="tel" placeholder="079 123 45 67" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field full">
                  <label htmlFor="note">{t.note}</label>
                  <textarea id="note" className="textarea" maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                <div className="hp" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
              <p className="muted small" style={{ margin: "20px 0 0" }}>
                {t.privacyNote}
              </p>
              <div className="step-actions">
                <button type="button" className="btn btn-light" onClick={() => setStep(2)}>{common.back}</button>
                <button type="submit" className="btn btn-dark" disabled={submitting}>{submitting ? t.submitting : t.submit}</button>
              </div>
            </form>
          )}
        </div>

        <aside className="summary" aria-label={t.summary}>
          <p className="eyebrow" style={{ marginBottom: 14 }}>{t.summary}</p>
          <dl>
            <div><dt>{t.service}</dt><dd>{service?.name ?? "–"}</dd></div>
            <div><dt>{t.with}</dt><dd>{owner}</dd></div>
            <div><dt>{t.date}</dt><dd>{date && step > 1 ? longDate(date) : "–"}</dd></div>
            <div><dt>{t.time}</dt><dd>{time ?? "–"}</dd></div>
            {service && <div><dt>{common.duration}</dt><dd>{formatDuration(service.durationMin, locale)}</dd></div>}
            {service && <div className="total"><dt>{common.price}</dt><dd>{service.priceFrom ? `${common.from} ` : ""}{formatChf(service.priceChf)}</dd></div>}
          </dl>
          <p className="muted small" style={{ margin: "18px 0 0" }}>{fill(t.payOnSite, { hours: cancelHours })}</p>
        </aside>
      </div>
    </div>
  );
}
