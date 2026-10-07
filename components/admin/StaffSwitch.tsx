import Link from "next/link";

/** Auswahl Zana, Hikmet, beide (oder Geschäft) als Segment-Leiste */
export function StaffSwitch({ current, options, href, label }: { current: string; options: { key: string; label: string }[]; href: (key: string) => string; label: string }) {
  return (
    <nav className="staff-switch" aria-label={label}>
      {options.map((o) => (
        <Link key={o.key} href={href(o.key)} className={o.key === current ? "on" : ""} aria-current={o.key === current ? "true" : undefined} scroll={false}>
          {o.label}
        </Link>
      ))}
    </nav>
  );
}
