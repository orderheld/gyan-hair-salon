const ICON: Record<string, React.ReactNode> = {
  visit: <><circle cx="6.5" cy="7" r="2.6" /><circle cx="6.5" cy="17" r="2.6" /><path d="M8.6 8.6 20 17.5M8.6 15.4 20 6.5" /></>,
  referral: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.7-3.2 2.9-5 5.5-5s4.8 1.8 5.5 5" /><path d="M18 8v6M15 11h6" /></>,
  review: <path d="M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z" />,
};

/**
 * Stempel als Kreise im Salon-Stil: volle Kreise sind gestempelt, der letzte ist der Gratis-Haarschnitt.
 * Bonusstempel (Einladung, Google-Bewertung) haben ein eigenes Symbol und eine kurze Legende.
 */
export function Stamps({ onCard, needed, freeLabel, label, kinds = [], legend, compact = false }: { onCard: number; needed: number; freeLabel: string; label: string; kinds?: string[]; legend?: { referral: string; review: string }; compact?: boolean }) {
  const ready = onCard >= needed;
  const kindAt = (i: number) => (kinds[i] && ICON[kinds[i]] ? kinds[i] : "visit");
  const bonus = (["referral", "review"] as const).filter((k) => kinds.slice(0, onCard).includes(k));
  return (
    <>
      <ol className={`lc-stamps${compact ? " is-compact" : ""}`} aria-label={label} role="img">
        {Array.from({ length: needed }, (_, i) => (
          <li key={i} className={i < onCard ? `lc-stamp is-on${kindAt(i) !== "visit" ? " is-bonus" : ""}` : "lc-stamp"} aria-hidden>
            {i < onCard ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{ICON[kindAt(i)]}</svg>
            ) : (
              i + 1
            )}
          </li>
        ))}
        <li className={`lc-stamp is-free${ready ? " is-ready" : ""}`} aria-hidden>{freeLabel}</li>
      </ol>
      {legend && bonus.length > 0 && (
        <ul className="lc-legend small muted">
          {bonus.map((k) => (
            <li key={k}>
              <span className="lc-stamp is-on is-bonus" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{ICON[k]}</svg></span>
              {legend[k]}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
