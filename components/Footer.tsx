import Link from "next/link";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row footer-top">
          <div>
            <div className="logo-mark" style={{ color: "var(--ink)" }}>GYAN</div>
            <div style={{ marginTop: 8 }}>
              {site.address.street}, {site.address.zip} {site.address.city}
            </div>
          </div>
          <nav aria-label="Footer">
            <Link href="/termin">Termin buchen</Link>
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a>
          </nav>
        </div>
        <div className="row">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <nav aria-label="Rechtliches">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
