import Link from "next/link";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { site } from "@/content/site";
import { getOpeningHours, getServices, type OpeningDay, type Service } from "@/lib/data";
import { formatChf, formatDuration } from "@/lib/format";
import { WEEKDAY_NAMES, zurichParts } from "@/lib/time";

export const dynamic = "force-dynamic";

async function load(): Promise<{ services: Service[]; hours: OpeningDay[] }> {
  try {
    const [services, hours] = await Promise.all([getServices(), getOpeningHours()]);
    return { services, hours };
  } catch (error) {
    console.error("[GYAN] Daten konnten nicht geladen werden:", error);
    return { services: [], hours: [] };
  }
}

export default async function Home() {
  const { services, hours } = await load();
  const today = zurichParts(new Date()).weekday;
  const week = [1, 2, 3, 4, 5, 6, 0].map((d) => hours.find((h) => h.weekday === d)).filter(Boolean) as OpeningDay[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: site.name,
    url: site.url,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.zip,
      addressLocality: "Biel/Bienne",
      addressCountry: "CH",
    },
    founder: { "@type": "Person", name: site.owner },
    openingHoursSpecification: week
      .filter((d) => d.isOpen)
      .map((d) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.weekday],
        opens: d.openTime,
        closes: d.closeTime,
      })),
    sameAs: [site.instagram],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Herren Coiffeur · Biel/Bienne</p>
            <h1 className="display">GYAN</h1>
            <p className="lead">
              Präzise Schnitte, ruhige Hände und die Zeit, die ein guter Haarschnitt verdient. Bei Zana, dem Inhaber, persönlich.
            </p>
            <div className="hero-actions">
              <Link href="/termin" className="btn btn-dark">Termin bei Zana buchen</Link>
              <Link href="#leistungen" className="btn btn-light">Leistungen & Preise</Link>
            </div>
            <a className="hero-rating" href={site.googleReviewsUrl} target="_blank" rel="noreferrer">
              <span className="stars" aria-hidden>★★★★★</span>
              <span>{site.rating.value} auf Google · über {site.rating.count} Bewertungen</span>
            </a>
          </Reveal>
          <Reveal delay={150} className="hero-media">
            <Photo src={site.images.hero} alt="Der Salon GYAN in Biel" label="Foto: Salon" mono priority />
          </Reveal>
        </div>
      </section>

      {/* Statement */}
      <section className="section">
        <div className="container">
          <Reveal>
            <p className="statement">
              Ein Haarschnitt ist kein Fliessband.{" "}
              <span className="soft">Er ist Handwerk. Mit Beratung, mit Ruhe und mit einem Namen, der dafür einsteht.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Geschichte */}
      <section id="geschichte" className="section bg-cream">
        <div className="container story-grid">
          <Reveal>
            <Photo src={site.images.zana} alt={`${site.owner}, Inhaber von GYAN`} label={`Foto: Portrait ${site.owner}`} />
          </Reveal>
          <Reveal delay={120} className="story-text">
            <p className="eyebrow">{site.story.eyebrow}</p>
            <h2 className="h1 serif" style={{ fontSize: "clamp(56px, 8vw, 104px)" }}>{site.story.title}</h2>
            <p className="lead">{site.story.lead}</p>
            {site.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <blockquote className="quote">
              «{site.story.quote}»
              <cite>{site.owner}, Inhaber</cite>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Versprechen */}
      <section className="section bg-sand">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Was GYAN ausmacht</p>
            <h2 className="h2" style={{ maxWidth: 760 }}>Weniger Durchlauf. Mehr Sorgfalt.</h2>
          </Reveal>
          <div className="promise-grid">
            {site.promises.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className="promise">
                <div className="num">0{i + 1}</div>
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section id="leistungen" className="section">
        <div className="container narrow" style={{ maxWidth: 920 }}>
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">Leistungen & Preise</p>
              <h2 className="h2">Klar. Ehrlich. Gut gemacht.</h2>
            </div>
            <Link href="/termin" className="arrow-link">Termin wählen ›</Link>
          </Reveal>
          {services.length > 0 ? (
            <ul className="price-list">
              {services.map((s) => (
                <li key={s.id} className="price-item">
                  <div>
                    <h3 className="h3">{s.name}</h3>
                    {s.description && <p>{s.description}</p>}
                  </div>
                  <div className="price-meta">
                    <span className="price">{s.priceFrom ? "ab " : ""}{formatChf(s.priceChf)}</span>
                    <span className="duration">{formatDuration(s.durationMin)}</span>
                    <Link href={`/termin?leistung=${s.id}`} className="arrow-link">Buchen ›</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Die Preisliste ist gerade nicht verfügbar. Ruf uns gerne an: {site.phone}</p>
          )}
        </div>
      </section>

      {/* Termin oder spontan */}
      <section className="section bg-cream">
        <div className="container">
          <Reveal className="center">
            <p className="eyebrow">Zwei Wege zu GYAN</p>
            <h2 className="h2">Mit Termin oder spontan.</h2>
          </Reveal>
          <div className="choice-grid">
            <Reveal className="choice dark">
              <span className="tag">Online buchbar</span>
              <h3 className="h2" style={{ fontSize: "clamp(28px, 3.4vw, 40px)" }}>Termin bei Zana.</h3>
              <p>
                Wähle Leistung und Uhrzeit. Ist der Termin frei, ist er sofort bestätigt, mit E-Mail und Kalendereintrag.
                Dein Platz ist reserviert, ohne Warten.
              </p>
              <div className="spacer" />
              <div><Link href="/termin" className="btn btn-dark">Jetzt Termin buchen</Link></div>
            </Reveal>
            <Reveal delay={120} className="choice light">
              <span className="tag">Ohne Voranmeldung</span>
              <h3 className="h2" style={{ fontSize: "clamp(28px, 3.4vw, 40px)" }}>Einfach vorbeikommen.</h3>
              <p>
                Unser Team ist während der Öffnungszeiten ohne Voranmeldung für dich da. Online-Termine gibt es nur bei
                Zana. Für alle anderen Coiffeure kommst du einfach vorbei.
              </p>
              <div className="spacer" />
              <div><Link href="#besuch" className="btn btn-light">Öffnungszeiten ansehen</Link></div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">Einblicke</p>
              <h2 className="h2">Handwerk, das man sieht.</h2>
            </div>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="arrow-link">Mehr auf Instagram ›</a>
          </Reveal>
          <div className="gallery">
            {site.images.gallery.map((src, i) => (
              <Photo key={i} src={src} alt={`Arbeit von GYAN, Bild ${i + 1}`} label={`Foto ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Besuch */}
      <section id="besuch" className="section bg-cream">
        <div className="container visit-grid">
          <Reveal>
            <p className="eyebrow">Besuch</p>
            <h2 className="h2">Mitten in Biel.</h2>
            <div className="contact-lines">
              <div>
                <div className="label">Adresse</div>
                <a className="link" href={site.address.mapsUrl} target="_blank" rel="noreferrer">
                  {site.address.street}, {site.address.zip} {site.address.city}
                </a>
              </div>
              <div>
                <div className="label">Telefon</div>
                <a className="link" href={site.phoneHref}>{site.phone}</a>
              </div>
              <div>
                <div className="label">Instagram</div>
                <a className="link" href={site.instagram} target="_blank" rel="noreferrer">@gyan_hair_salon</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h3 className="h3" style={{ marginBottom: 12 }}>Öffnungszeiten</h3>
            <ul className="hours">
              {week.map((d) => (
                <li key={d.weekday} className={d.weekday === today ? "today" : ""}>
                  <span>{WEEKDAY_NAMES[d.weekday]}</span>
                  {d.isOpen ? (
                    <span>{d.openTime} – {d.closeTime}</span>
                  ) : (
                    <span className="closed">Geschlossen</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Abschluss */}
      <section className="section bg-ink center">
        <div className="container">
          <Reveal>
            <h2 className="display" style={{ fontSize: "clamp(44px, 7vw, 96px)" }}>Bereit für deinen Schnitt?</h2>
            <p className="lead" style={{ maxWidth: 560, margin: "24px auto 40px" }}>
              In weniger als einer Minute gebucht. Sofort bestätigt.
            </p>
            <Link href="/termin" className="btn btn-dark" style={{ background: "var(--ivory)", color: "var(--ink)" }}>
              Termin bei Zana buchen
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
