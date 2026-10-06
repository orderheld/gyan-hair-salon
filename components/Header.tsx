import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" aria-label="GYAN Hair Salon, Startseite">
          <span className="logo-mark">GYAN</span>
          <span className="logo-sub">Hair Salon · Biel</span>
        </Link>
        <nav className="nav" aria-label="Hauptnavigation">
          <Link href="/#geschichte">Zana</Link>
          <Link href="/#leistungen">Leistungen</Link>
          <Link href="/#besuch">Besuch</Link>
          <Link href="/termin" className="btn btn-dark btn-sm">Termin buchen</Link>
        </nav>
      </div>
    </header>
  );
}
