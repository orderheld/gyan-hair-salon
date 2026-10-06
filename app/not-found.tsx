import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="section center">
          <div className="container narrow">
            <p className="eyebrow">404</p>
            <h1 className="h2">Diese Seite gibt es nicht.</h1>
            <p className="lead" style={{ margin: "20px 0 36px" }}>Vielleicht suchst du einen Termin?</p>
            <Link className="btn btn-dark" href="/termin">Termin buchen</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
