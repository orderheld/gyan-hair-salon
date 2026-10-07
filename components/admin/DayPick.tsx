"use client";

// Datum wählen: springt sofort zum gewählten Tag, der Knopf bleibt für ältere Browser.
// key={day}: beim Blättern mit ‹ › bleibt die Seite im Browser, das Feld muss das neue Datum zeigen.
export function DayPick({ day, label, keep = {} }: { day: string; label: string; keep?: Record<string, string> }) {
  return (
    <form className="day-pick">
      {Object.entries(keep).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input key={day} type="date" name="datum" defaultValue={day} className="input" aria-label={label} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
      <button className="btn btn-light btn-sm day-pick-go" type="submit">{label}</button>
    </form>
  );
}
