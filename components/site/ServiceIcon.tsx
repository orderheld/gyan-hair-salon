/**
 * Eigene Linien-Symbole für die Leistungen, im selben feinen Strich wie Zanas Unterschrift.
 * Zuordnung: lib/service-icon.ts
 */
const ICONS: Record<string, React.ReactNode> = {
  // Schere
  cut: (
    <>
      <circle cx="20" cy="50" r="6" />
      <circle cx="44" cy="50" r="6" />
      <path d="M24 45.5 47 10M40 45.5 17 10" />
      <circle cx="32" cy="27.5" r="1.2" />
    </>
  ),
  // Haarschneidemaschine mit Verlauf
  fade: (
    <>
      <path d="M22 10h14a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
      <path d="M18 18h22M22 10v-3M26 10v-3M30 10v-3M34 10v-3M29 26v6" />
      <path d="M10 48h44M14 53h36M19 58h26" />
    </>
  ),
  // Schere und Kamm gekreuzt
  combo: (
    <>
      <circle cx="14" cy="50" r="5" />
      <circle cx="32" cy="50" r="5" />
      <path d="M17 46 35 16M29 46 11 16" />
      <circle cx="23" cy="31" r="1" />
      <path d="M44 8h8v48h-8z" />
      <path d="M44 14h-5M44 19h-5M44 24h-5M44 29h-5M44 34h-5M44 39h-5M44 44h-5M44 49h-5" />
    </>
  ),
  // Bart
  beard: (
    <>
      <path d="M12 18c0 22 8 38 20 38s20-16 20-38" />
      <path d="M20 30c4-4 8-5 12-1 4-4 8-3 12 1" />
      <path d="M26 42c4 2 8 2 12 0" />
      <path d="M22 22v6M42 22v6" />
    </>
  ),
  // Rasiermesser
  razor: (
    <>
      <path d="M14 20h30c6 0 10 4 10 10H14z" />
      <path d="M22 30v-4M14 24h32" />
      <circle cx="14" cy="25" r="2.5" />
      <path d="M12 27c-3 7-4 15-1 23h5c-2-8-1-15 1-21" />
    </>
  ),
  // Kamm mit kleinem Stern
  kids: (
    <>
      <path d="M8 34h40v6H8z" />
      <path d="M12 40v12M17 40v12M22 40v12M27 40v12M32 40v12M37 40v12M42 40v12" />
      <path d="M46 10l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      <path d="M26 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
    </>
  ),
  // Signature: Stern im Kreis
  signature: (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 16l3.5 12.5L48 32l-12.5 3.5L32 48l-3.5-12.5L16 32l12.5-3.5z" />
      <circle cx="32" cy="32" r="28" strokeDasharray="1 5" />
    </>
  ),
};

export function ServiceIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg className={`svc-icon ${className}`.trim()} viewBox="0 0 64 64" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name] ?? ICONS.cut}
    </svg>
  );
}
