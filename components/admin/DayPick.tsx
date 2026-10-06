"use client";

// Datum wählen: springt sofort zum gewählten Tag, der Knopf bleibt für ältere Browser
export function DayPick({ day, label }: { day: string; label: string }) {
  return (
    <form className="day-pick">
      <input type="date" name="datum" defaultValue={day} className="input" onChange={(e) => e.currentTarget.form?.requestSubmit()} />
      <button className="btn btn-light btn-sm day-pick-go" type="submit">{label}</button>
    </form>
  );
}
