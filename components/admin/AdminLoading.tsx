/** Platzhalter beim Seitenwechsel im Admin: erscheint sofort, bis die Daten da sind */
export function AdminLoading() {
  return (
    <div className="adm-skel" aria-busy="true" aria-live="polite">
      <span className="sr-only">…</span>
      <div className="adm-skel-title" />
      <div className="adm-skel-bar" />
      <div className="panel adm-skel-panel">
        {[0, 1, 2, 3].map((i) => <div key={i} className="adm-skel-row" />)}
      </div>
    </div>
  );
}
