"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatChf, formatDuration } from "@/lib/format";

type Service = { id: number; name: string; description: string; durationMin: number; priceChf: number; priceFrom: boolean };
type Props = { services: Service[]; initialServiceId?: number; phone: string; phoneHref: string };

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const DAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function longDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return `${WEEKDAYS[wd]}, ${d}. ${MONTHS[m - 1]} ${y}`;
}

export function BookingFlow({ services, initialServiceId, phone, phoneHref }: Props) {
  const router = useRouter();
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
      setError("Die freien Termine konnten nicht geladen werden. Bitte versuche es nochmals.");
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

  function chooseService(s: Service) {
    setService(s);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        body: JSON.stringify({ serviceId: service.id, date, time, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Buchung fehlgeschlagen.");
        if (res.status === 409) {
          setTime(null);
          setStep(2);
          loadAvailability(service, true);
        }
        return;
      }
      router.push(`/termin/bestaetigt?id=${data.id}`);
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte versuche es nochmals.");
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
    { label: "Vormittag", items: slots.filter((t) => t < "12:00") },
    { label: "Nachmittag", items: slots.filter((t) => t >= "12:00" && t < "17:00") },
    { label: "Abend", items: slots.filter((t) => t >= "17:00") },
  ].filter((g) => g.items.length);

  return (
    <div className="booking">
      <ol className="steps" aria-label="Fortschritt">
        {["Leistung", "Datum & Zeit", "Angaben"].map((label, i) => (
          <li key={label} className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}>
            <button type="button" disabled={i + 1 > step} onClick={() => setStep((i + 1) as 1 | 2 | 3)}>
              <span className="dot">{i + 1}</span>
              {label}
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
                    {s.description && <span className="desc">{s.description}</span>}
                  </span>
                  <span className="meta">
                    <span className="price">{s.priceFrom ? "ab " : ""}{formatChf(s.priceChf)}</span>
                    <span className="duration">{formatDuration(s.durationMin)}</span>
                  </span>
                </button>
              ))}
              {services.length === 0 && <p className="muted">Zurzeit sind keine Leistungen online buchbar.</p>}
            </div>
          )}

          {step === 2 && service && (
            <div className="picker">
              {loading && !days && <p className="muted">Freie Zeiten werden geladen …</p>}
              {days && available.size === 0 && (
                <div className="empty">
                  <h3 className="h3">Im Moment ist alles ausgebucht.</h3>
                  <p className="muted">Ruf uns gerne an, vielleicht ergibt sich kurzfristig etwas: <a className="link" href={phoneHref}>{phone}</a></p>
                </div>
              )}
              {days && available.size > 0 && month && cal && (
                <>
                  <div className="calendar">
                    <div className="cal-head">
                      <button type="button" className="cal-nav" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label="Vorheriger Monat">‹</button>
                      <span>{MONTHS[month.m]} {month.y}</span>
                      <button type="button" className="cal-nav" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Nächster Monat">›</button>
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
                            onClick={() => { setDate(k); setTime(null); }}
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
                            <button key={t} type="button" className={`time ${time === t ? "selected" : ""}`} onClick={() => setTime(t)}>
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
                <button type="button" className="btn btn-light" onClick={() => setStep(1)}>Zurück</button>
                <button type="button" className="btn btn-dark" disabled={!date || !time} onClick={() => setStep(3)}>Weiter</button>
              </div>
            </div>
          )}

          {step === 3 && service && date && time && (
            <form className="details" onSubmit={submit}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="name">Vor- und Nachname</label>
                  <input id="name" className="input" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="email">E-Mail</label>
                  <input id="email" type="email" className="input" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefon</label>
                  <input id="phone" type="tel" className="input" required autoComplete="tel" placeholder="079 123 45 67" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="field full">
                  <label htmlFor="note">Wunsch oder Hinweis (optional)</label>
                  <textarea id="note" className="textarea" maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
                <div className="hp" aria-hidden>
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                </div>
              </div>
              <p className="muted small" style={{ margin: "20px 0 0" }}>
                Mit der Buchung erhältst du eine Bestätigung per E-Mail. Deine Angaben verwenden wir nur für diesen Termin.
              </p>
              <div className="step-actions">
                <button type="button" className="btn btn-light" onClick={() => setStep(2)}>Zurück</button>
                <button type="submit" className="btn btn-dark" disabled={submitting}>{submitting ? "Wird gebucht …" : "Verbindlich buchen"}</button>
              </div>
            </form>
          )}
        </div>

        <aside className="summary" aria-label="Deine Auswahl">
          <p className="eyebrow" style={{ marginBottom: 14 }}>Deine Auswahl</p>
          <dl>
            <div><dt>Leistung</dt><dd>{service?.name ?? "–"}</dd></div>
            <div><dt>Bei</dt><dd>Zana</dd></div>
            <div><dt>Datum</dt><dd>{date && step > 1 ? longDate(date) : "–"}</dd></div>
            <div><dt>Uhrzeit</dt><dd>{time ?? "–"}</dd></div>
            {service && <div><dt>Dauer</dt><dd>{formatDuration(service.durationMin)}</dd></div>}
            {service && <div className="total"><dt>Preis</dt><dd>{service.priceFrom ? "ab " : ""}{formatChf(service.priceChf)}</dd></div>}
          </dl>
          <p className="muted small" style={{ margin: "18px 0 0" }}>Bezahlung vor Ort. Stornierung online bis 12 Stunden vorher.</p>
        </aside>
      </div>
    </div>
  );
}
