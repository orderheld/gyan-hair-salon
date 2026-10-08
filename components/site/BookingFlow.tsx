"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/content/types";
import { formatChf, formatDuration } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict/de";
import { fill } from "@/lib/i18n/fill";
import { askPushPermission } from "@/lib/push-client";

type Service = { id: number; name: string; short: string; durationMin: number; priceChf: number; priceFrom: boolean; category: string; popular: boolean };
type Props = {
  locale: Locale;
  t: Dict["booking"];
  common: Pick<Dict["common"], "from" | "back" | "next" | "duration" | "price" | "weekdays" | "weekdaysShort" | "months">;
  services: Service[];
  /** Gruppennamen (Haarschnitt, Bart …) und «Beliebt» */
  serviceGroups: Record<string, string>;
  popularLabel: string;
  initialServiceId?: number;
  phone: string;
  phoneHref: string;
  owner: string;
  cancelHours: number;
  okHref: string;
  privacyHref: string;
  /** Angemeldeter Kunde («Mein Konto»): Kontaktdaten schon ausgefüllt */
  known?: { name: string; email: string; phone: string; birthDate?: string };
  /** «Mein Konto»: dort ändern angemeldete Kunden ihre Angaben */
  accountHref: string;
  /** Freie Zeiten pro Dauer, schon vom Server mitgeliefert (spart eine Anfrage) */
  initialAvailability?: ByDuration;
  availabilityAt?: number;
};
type Days = Record<string, string[]>;
type ByDuration = Record<number, Days>;
/** Danach werden die freien Zeiten im Hintergrund aufgefrischt */
const STALE_MS = 90_000;

const pad = (n: number) => String(n).padStart(2, "0");
const parseKey = (key: string) => key.split("-").map(Number) as [number, number, number];
const addDay = (key: string, n: number) => {
  const [y, m, d] = parseKey(key);
  const date = new Date(Date.UTC(y, m - 1, d + n, 12));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};
const weekdayOf = (key: string) => {
  const [y, m, d] = parseKey(key);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
};
const todayZurich = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
const PARTS = [
  { key: "morning", test: (t: string) => t < "12:00" },
  { key: "afternoon", test: (t: string) => t >= "12:00" && t < "17:00" },
  { key: "evening", test: (t: string) => t >= "17:00" },
] as const;

export function BookingFlow({ locale, t, common, services, serviceGroups, popularLabel, initialServiceId, phone, phoneHref, owner, cancelHours, okHref, privacyHref, known, accountHref, initialAvailability, availabilityAt }: Props) {
  const router = useRouter();
  const MONTHS = common.months;
  const intl = locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "en-GB";
  const fmtKey = (key: string, opts: Intl.DateTimeFormatOptions) => {
    const [y, m, d] = parseKey(key);
    return new Intl.DateTimeFormat(intl, { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  };
  const longDate = (key: string) => fmtKey(key, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const initial = services.find((s) => s.id === initialServiceId) ?? null;
  const [service, setService] = useState<Service | null>(initial);
  const [step, setStep] = useState<1 | 2 | 3>(initial ? 2 : 1);
  const [byDuration, setByDuration] = useState<ByDuration | null>(initialAvailability ?? null);
  const loadedAt = useRef(initialAvailability ? availabilityAt ?? Date.now() : 0);
  const days = service && byDuration ? byDuration[service.durationMin] ?? null : null;
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<string | null>(() => {
    const d = initial && initialAvailability?.[initial.durationMin];
    return d ? Object.keys(d).sort()[0] ?? null : null;
  });
  const [time, setTime] = useState<string | null>(null);
  const [part, setPart] = useState<number>(0);
  const [form, setForm] = useState({ name: known?.name ?? "", email: known?.email ?? "", phone: known?.phone ?? "", birthDate: known?.birthDate ?? "", note: "", website: "", consent: false });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // E-Mail-Code
  const [stage, setStage] = useState<"form" | "code">("form");
  const [code, setCode] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  /** Freie Zeiten für alle Leistungen auf einmal laden. Wechselt man die Leistung, ist alles schon da. */
  const loadingRef = useRef<Promise<ByDuration | null> | null>(null);
  async function loadAll(quiet = false): Promise<ByDuration | null> {
    if (loadingRef.current) {
      // Läuft schon (Vorladen): mitwarten und dabei «lädt» zeigen
      if (!quiet) {
        setLoading(true);
        loadingRef.current.finally(() => setLoading(false));
      }
      return loadingRef.current;
    }
    if (!quiet) setLoading(true);
    loadingRef.current = (async () => {
      try {
        const res = await fetch("/api/availability", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        loadedAt.current = Date.now();
        setByDuration(data.byDuration);
        return data.byDuration as ByDuration;
      } catch {
        if (!quiet) setError(t.errors.load);
        return null;
      } finally {
        loadingRef.current = null;
        if (!quiet) setLoading(false);
      }
    })();
    return loadingRef.current;
  }

  /** Neu laden; mit keepSelection bleibt der Tag, die Zeit nur, wenn sie noch frei ist */
  async function loadAvailability(s: Service, keepSelection = false) {
    setError(null);
    const all = await loadAll(keepSelection && !!byDuration);
    const fresh = all?.[s.durationMin];
    if (!fresh) return;
    if (!keepSelection) {
      setDate(Object.keys(fresh).sort()[0] ?? null);
      setTime(null);
    } else {
      setTime((t0) => (t0 && date && fresh[date]?.includes(t0) ? t0 : null));
    }
  }

  // Leistung gewählt: Zeiten sofort aus dem Vorrat zeigen, sonst laden; alte Daten still auffrischen
  const firstService = useRef(true);
  useEffect(() => {
    if (!service) return;
    const have = byDuration?.[service.durationMin];
    const keepDate = firstService.current && !!date;
    firstService.current = false;
    if (!have) {
      loadAvailability(service);
      return;
    }
    if (!keepDate) {
      setDate(Object.keys(have).sort()[0] ?? null);
      setTime(null);
    }
    if (Date.now() - loadedAt.current > STALE_MS) loadAvailability(service, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  // Schon auf der Seite, aber die Zeiten fehlen noch (z. B. Schritt 1): im Hintergrund vorladen
  useEffect(() => {
    if (!byDuration) loadAll(true);
    const onShow = () => {
      if (document.visibilityState === "visible" && Date.now() - loadedAt.current > STALE_MS && service) loadAvailability(service, true);
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id]);

  // Tagesleiste: von heute bis zum letzten buchbaren Tag, volle Tage bleiben sichtbar (ausgegraut)
  const dayList = useMemo(() => {
    const keys = Object.keys(days ?? {}).sort();
    if (!keys.length) return [];
    const start = [todayZurich(), keys[0]].sort()[0];
    const list: string[] = [];
    for (let k = start; k <= keys[keys.length - 1] && list.length < 120; k = addDay(k, 1)) list.push(k);
    return list;
  }, [days]);
  const earliest = useMemo(() => {
    const first = Object.keys(days ?? {}).sort()[0];
    return first && days?.[first]?.[0] ? { date: first, time: days[first][0] } : null;
  }, [days]);

  const slots = date && days ? days[date] ?? [] : [];
  const groups = PARTS.map((p) => ({ key: p.key, label: t[p.key], items: slots.filter(p.test) }));

  // Beim Tageswechsel den ersten Tagesteil mit freien Zeiten zeigen (oder den der gewählten Zeit)
  useEffect(() => {
    const withTime = time ? PARTS.findIndex((p) => p.test(time)) : -1;
    const firstFree = groups.findIndex((g) => g.items.length);
    setPart(withTime >= 0 ? withTime : Math.max(0, firstFree));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, days]);

  // Gewählten Tag in der Leiste mittig halten
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    const btn = strip?.querySelector<HTMLElement>(".day.selected");
    if (strip && btn) strip.scrollTo({ left: btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
  }, [date, step, dayList.length]);
  const scrollStrip = (dir: 1 | -1) => stripRef.current?.scrollBy({ left: dir * stripRef.current.clientWidth * 0.8, behavior: "smooth" });

  // Bei jedem Schritt an den Anfang der Buchung springen (sonst landet man im Footer)
  const rootRef = useRef<HTMLDivElement>(null);
  const pushAsk = useRef<Promise<unknown> | null>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    const el = rootRef.current;
    if (!el) return;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 72;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - header - 16), behavior: "smooth" });
  }, [step, stage]);

  /** Sanft zum nächsten Bedienelement scrollen, nur wenn es nicht schon sichtbar ist */
  const reveal = (selector: string) =>
    requestAnimationFrame(() => rootRef.current?.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "nearest" }));

  // Countdown für «Code erneut senden»
  useEffect(() => {
    if (stage !== "code" || resendAt <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [stage, resendAt]);
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));

  function chooseService(s: Service) {
    setService(s);
    setStep(2);
  }

  function pickDay(k: string) {
    setDate(k);
    setTime(null);
    reveal(".times");
  }

  /** Erst Code anfordern, oder direkt buchen, wenn dieser Browser die Adresse schon bestätigt hat */
  async function requestCode(again = false) {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.errors.generic);
        if (data.seconds) {
          setResendAt(Date.now() + data.seconds * 1000);
          setNow(Date.now());
        }
        return;
      }
      if (data.verified) {
        await book();
        return;
      }
      setStage("code");
      setCode("");
      setResendAt(Date.now() + (data.resendIn ?? 30) * 1000);
      setNow(Date.now());
      if (again) setInfo(t.verify.sent);
    } catch {
      setError(t.errors.network);
    } finally {
      setSubmitting(false);
    }
  }

  async function book(withCode?: string) {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, date, time, locale, ...form, code: withCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.errors.generic);
        if (data.needCode) setStage("form");
        if (data.codeError === "wrong") setCode("");
        if (res.status === 409) {
          setTime(null);
          setStep(2);
          setStage("form");
          loadAvailability(service, true);
        }
        return;
      }
      // Offene Push-Abfrage nicht durch den Seitenwechsel abbrechen (höchstens 15 Sekunden warten)
      if (pushAsk.current) await Promise.race([pushAsk.current, new Promise((r) => setTimeout(r, 15000))]);
      router.push(`${okHref}?id=${data.id}`);
    } catch {
      setError(t.errors.network);
    } finally {
      setSubmitting(false);
    }
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    // Direkt im Klick nach Push-Erlaubnis fragen (Erinnerung aufs Handy); die Buchung läuft parallel weiter
    if (!pushAsk.current) pushAsk.current = askPushPermission();
    requestCode();
  }

  function submitCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (code.length === 6 && !submitting) book(code);
  }

  const groupIndex = Math.min(part, groups.length - 1);
  const current = groups[groupIndex];

  return (
    <div className="booking" ref={rootRef}>
      <ol className="steps" aria-label={t.eyebrow}>
        {t.steps.map((label, i) => (
          <li key={label} className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}>
            <button type="button" disabled={i + 1 > step} onClick={() => { setStep((i + 1) as 1 | 2 | 3); setStage("form"); }}>
              <span className="dot">{i + 1}</span>
              <span className="step-lbl">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="booking-grid">
        {/* Handy: Auswahl als eine Zeile über dem Formular, die volle Übersicht steht darunter */}
        {service && step > 1 && (
          <p className="summary-line" aria-hidden>
            <strong>{service.name}</strong>
            {date && <span>{fmtKey(date, { weekday: "short", day: "numeric", month: "numeric" })}{time ? ` · ${time}` : ""}</span>}
            <span>{service.priceFrom ? `${common.from} ` : ""}{formatChf(service.priceChf)}</span>
          </p>
        )}
        <div className="booking-main">
          {error && <div className="alert alert-error" role="alert" style={{ marginBottom: 20 }}>{error}</div>}
          {info && !error && <div className="alert alert-ok" role="status" style={{ marginBottom: 20 }}>{info}</div>}

          {step === 1 && (
            <div className="service-list">
              {services.map((s, i) => (
                <Fragment key={s.id}>
                {serviceGroups[s.category] && s.category !== services[i - 1]?.category && <p className="service-group">{serviceGroups[s.category]}</p>}
                <button type="button" className={`service-option ${service?.id === s.id ? "selected" : ""}`} onClick={() => chooseService(s)}>
                  <span>
                    <strong>{s.name}{s.popular && <em className="service-pop">★ {popularLabel}</em>}</strong>
                    {s.short && <span className="desc">{s.short}</span>}
                  </span>
                  <span className="meta">
                    <span className="price">{s.priceFrom ? `${common.from} ` : ""}{formatChf(s.priceChf)}</span>
                    <span className="duration">{formatDuration(s.durationMin, locale)}</span>
                  </span>
                </button>
                </Fragment>
              ))}
              {services.length === 0 && <p className="muted">{t.noServices}</p>}
            </div>
          )}

          {step === 2 && service && (
            <div className="picker">
              {!days && (loading || !error) && <p className="muted">{t.loading}</p>}
              {days && dayList.length === 0 && (
                <div className="empty">
                  <h3 className="h3">{t.noSlotsTitle}</h3>
                  <p className="muted">{t.noSlotsText} <a className="link" href={phoneHref}>{phone}</a></p>
                </div>
              )}
              {days && dayList.length > 0 && (
                <>
                  {earliest && (
                    <button
                      type="button"
                      className={`earliest ${date === earliest.date && time === earliest.time ? "selected" : ""}`}
                      onClick={() => { setDate(earliest.date); setTime(earliest.time); reveal(".picker > .step-actions"); }}
                    >
                      <span className="earliest-dot" aria-hidden />
                      <span className="earliest-text">
                        <span className="earliest-label">{t.earliest}</span>
                        <strong>{fmtKey(earliest.date, { weekday: "short", day: "numeric", month: "long" })} · {earliest.time}</strong>
                      </span>
                      <span className="earliest-arrow" aria-hidden>→</span>
                    </button>
                  )}

                  <div className="strip-head">
                    <span className="strip-title">{t.pickDay}</span>
                    <span className="strip-month">{date ? `${MONTHS[parseKey(date)[1] - 1]} ${parseKey(date)[0]}` : ""}</span>
                    <span className="strip-nav">
                      <button type="button" onClick={() => scrollStrip(-1)} aria-label={t.prevMonth}>‹</button>
                      <button type="button" onClick={() => scrollStrip(1)} aria-label={t.nextMonth}>›</button>
                    </span>
                  </div>
                  <div className="day-strip" ref={stripRef} role="listbox" aria-label={t.pickDay}>
                    {dayList.map((k, i) => {
                      const n = days[k]?.length ?? 0;
                      const [, m, d] = parseKey(k);
                      return (
                        <button
                          key={k}
                          type="button"
                          role="option"
                          aria-selected={date === k}
                          aria-label={longDate(k)}
                          className={`day ${date === k ? "selected" : ""} ${n ? "" : "full"}`}
                          disabled={!n}
                          onClick={() => pickDay(k)}
                        >
                          <span className="day-mon">{i === 0 || d === 1 ? MONTHS[m - 1].slice(0, 3) : " "}</span>
                          <span className="day-dow">{common.weekdaysShort[weekdayOf(k)]}</span>
                          <span className="day-num">{d}</span>
                        </button>
                      );
                    })}
                  </div>

                  {date && (
                    <div className="times">
                      <h3 className="times-title">{longDate(date)}</h3>
                      <div className="seg" role="tablist" aria-label={t.pickTime}>
                        {groups.map((g, i) => (
                          <button
                            key={g.key}
                            type="button"
                            role="tab"
                            aria-selected={i === groupIndex}
                            className={i === groupIndex ? "active" : ""}
                            disabled={!g.items.length}
                            onClick={() => setPart(i)}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                      <div className="slot-grid" role="tabpanel">
                        {current?.items.map((x) => (
                          <button
                            key={x}
                            type="button"
                            className={`slot ${time === x ? "selected" : ""}`}
                            aria-pressed={time === x}
                            onClick={() => { setTime(x); reveal(".picker > .step-actions"); }}
                          >
                            {x}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="step-actions">
                <button type="button" className="btn btn-light" onClick={() => setStep(1)}>{common.back}</button>
                <button type="button" className="btn btn-dark" disabled={!date || !time} onClick={() => setStep(3)}>{common.next}</button>
              </div>
            </div>
          )}

          {step === 3 && service && date && time && stage === "form" && (
            <form className="details" onSubmit={submitForm}>
              {known && (
                <p className="locked-note">
                  {t.locked.split("{account}")[0]}
                  <a className="link" href={accountHref}>{t.lockedAccount}</a>
                  {t.locked.split("{account}")[1]}
                </p>
              )}
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">{t.name}</label>
                  <input id="name" className="input" required autoComplete="name" readOnly={!!known?.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="birthDate">{t.birthDate}</label>
                  <input id="birthDate" type="date" className="input" required autoComplete="bday" min="1900-01-01" max={todayZurich()} readOnly={!!known?.birthDate} value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                  {known && !known.birthDate && <small className="field-hint">{t.birthOnce}</small>}
                </div>
                <div className="field">
                  <label htmlFor="email">{t.email}</label>
                  <input id="email" type="email" className="input" required autoComplete="email" inputMode="email" readOnly={!!known} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="phone">{t.phone}</label>
                  <input id="phone" type="tel" className="input" required autoComplete="tel" placeholder="079 123 45 67" readOnly={!!known?.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
              <label className="consent">
                <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
                <span>
                  {t.consent.split("{privacy}")[0]}
                  <a className="link" href={privacyHref} target="_blank" rel="noopener">{t.consentPrivacy}</a>
                  {t.consent.split("{privacy}")[1]}
                </span>
              </label>
              <p className="muted small" style={{ margin: "14px 0 0" }}>
                {t.privacyNote}
              </p>
              <div className="step-actions">
                <button type="button" className="btn btn-light" onClick={() => setStep(2)}>{common.back}</button>
                <button type="submit" className="btn btn-dark" disabled={submitting}>{submitting ? t.verify.sending : t.submit}</button>
              </div>
            </form>
          )}

          {step === 3 && service && date && time && stage === "code" && (
            <form className="verify" onSubmit={submitCode}>
              <span className="verify-icon" aria-hidden>
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="11" width="36" height="26" rx="4" />
                  <path d="M7 13l17 13 17-13" />
                </svg>
              </span>
              <h3 className="h3">{t.verify.title}</h3>
              <p className="muted">{fill(t.verify.text, { email: form.email })}</p>
              <label className="verify-label" htmlFor="code">{t.verify.label}</label>
              <input
                id="code"
                className="code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6 && !submitting) book(v);
                }}
              />
              <button type="submit" className="btn btn-dark verify-submit" disabled={code.length !== 6 || submitting}>
                {submitting ? t.verify.checking : t.verify.confirm}
              </button>
              <div className="verify-links">
                <button type="button" className="link-btn" disabled={resendIn > 0 || submitting} onClick={() => requestCode(true)}>
                  {resendIn > 0 ? fill(t.verify.resendIn, { s: resendIn }) : t.verify.resend}
                </button>
                <button type="button" className="link-btn" onClick={() => { setStage("form"); setError(null); setInfo(null); }}>
                  {t.verify.change}
                </button>
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
