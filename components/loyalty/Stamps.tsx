/** Stempel als Kreise im Salon-Stil: volle Kreise sind gestempelt, der letzte ist der Gratis-Haarschnitt. */
export function Stamps({ onCard, needed, freeLabel, label, compact = false }: { onCard: number; needed: number; freeLabel: string; label: string; compact?: boolean }) {
  const ready = onCard >= needed;
  return (
    <ol className={`lc-stamps${compact ? " is-compact" : ""}`} aria-label={label} role="img">
      {Array.from({ length: needed }, (_, i) => (
        <li key={i} className={i < onCard ? "lc-stamp is-on" : "lc-stamp"} aria-hidden>
          {i < onCard ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6.5" cy="7" r="2.6" />
              <circle cx="6.5" cy="17" r="2.6" />
              <path d="M8.6 8.6 20 17.5M8.6 15.4 20 6.5" />
            </svg>
          ) : (
            i + 1
          )}
        </li>
      ))}
      <li className={`lc-stamp is-free${ready ? " is-ready" : ""}`} aria-hidden>{freeLabel}</li>
    </ol>
  );
}
