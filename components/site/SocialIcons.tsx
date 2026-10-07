/** Monoline-Icons für Instagram, TikTok und Facebook (Strichstärke wie die übrigen Icons) */
export function SocialIcon({ name, className }: { name: "instagram" | "tiktok" | "facebook"; className?: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className, "aria-hidden": true };
  if (name === "instagram")
    return (
      <svg {...common}>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" />
      </svg>
    );
  if (name === "tiktok")
    return (
      <svg {...common}>
        <path d="M14 3v11.6a3.6 3.6 0 1 1-3.6-3.6" />
        <path d="M14 3c.4 2.6 2.2 4.4 4.8 4.6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M14.6 21v-7.4h2.6l.4-3h-3V8.8c0-.9.3-1.5 1.6-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H9v3h2.6V21" />
    </svg>
  );
}
