import type { Metadata } from "next";
import "./styles/base.css";

export const metadata: Metadata = { title: "404 · GYAN Hair Salon", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="de-CH">
      <body>
        <section className="nf" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p className="eyebrow">404</p>
            <h1 className="h1">Diese Seite gibt es nicht.</h1>
            <p className="lead">Cette page n’existe pas · This page does not exist.</p>
            <p><a className="btn btn-dark" href="/">GYAN Hair Salon</a></p>
          </div>
        </section>
      </body>
    </html>
  );
}
