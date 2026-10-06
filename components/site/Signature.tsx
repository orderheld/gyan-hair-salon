/**
 * Zanas echte Unterschrift, nachgezeichnet aus seinem Instagram-Bild
 * (public/images/signatur.jpg). Wird beim Einblenden wie mit einem
 * Kugelschreiber Strich für Strich gezogen.
 */
const PATH =
  "M60 205 C120 150 210 80 265 42 C278 34 270 60 250 85 C190 170 110 300 70 430 C55 480 50 515 70 510 C110 500 200 380 260 290 C300 225 330 160 345 130 C352 112 330 110 305 130 C250 175 185 280 172 345 C166 378 190 385 215 365 C270 320 340 230 368 180 C376 165 385 150 392 158 C400 175 400 235 412 245 C425 235 440 205 458 212 C476 220 476 262 492 266 C505 255 520 225 538 228 C556 232 560 288 592 290 C632 290 668 236 692 172 C698 156 708 158 712 172 C722 204 760 214 800 210 C860 204 910 196 945 182";

export function Signature({ className = "", label, reveal = false }: { className?: string; label: string; reveal?: boolean }) {
  return (
    <svg
      className={`sig ${className}`.trim()}
      viewBox="40 25 925 505"
      role="img"
      aria-label={label}
      {...(reveal ? { "data-reveal": "" } : {})}
    >
      <path d={PATH} pathLength={1} fill="none" stroke="currentColor" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
