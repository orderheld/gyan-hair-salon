// Schere als Linienzeichnung. Die beiden Klingen lassen sich per CSS einzeln drehen (.blade-a / .blade-b).
export function Scissors({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g className="blade-a">
        <circle cx="9" cy="8" r="6" />
        <path d="M14 10.5 L30 16.4 L61 17.2 L31 14.6 Z" fill="currentColor" stroke="none" />
      </g>
      <g className="blade-b">
        <circle cx="9" cy="24" r="6" />
        <path d="M14 21.5 L30 15.6 L61 14.8 L31 17.4 Z" fill="currentColor" stroke="none" />
      </g>
      <circle cx="30" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
