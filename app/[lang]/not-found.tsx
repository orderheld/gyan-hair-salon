import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";

// Wird bei notFound() innerhalb einer Sprache angezeigt. Sprache ist hier nicht bekannt -> Deutsch mit Links.
export default function NotFound() {
  const d = getDict("de");
  return (
    <section className="nf">
      <div className="container narrow center">
        <p className="eyebrow">404</p>
        <h1 className="h1">{d.notFound.title}</h1>
        <p className="lead">{d.notFound.text}</p>
        <div className="btn-row center">
          <Link className="btn btn-dark" href={href("de", "booking")}>{d.common.book}</Link>
          <Link className="btn btn-light" href="/de">GYAN</Link>
        </div>
        <Wordmark className="nf-mark" />
      </div>
    </section>
  );
}
