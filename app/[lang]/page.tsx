import { Signature } from "@/components/site/Signature";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { posts } from "@/content/blog";
import { site } from "@/content/site";
import type { L, Locale } from "@/content/types";
import { Filmstrip } from "@/components/motion/Filmstrip";
import { CtaBand, SectionHead, ServiceRows, Visit, Words } from "@/components/site/Blocks";
import { Intro } from "@/components/site/Intro";
import { PostCard } from "@/components/site/PostCard";
import { getSalonHours, getServices, localize } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href, type Locale as Lc } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { Wordmark } from "@/components/brand/Logo";
import { LiveChip, LiveSlot } from "@/components/site/LiveInfo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, description: d.meta.siteDescription, path: (l) => href(l, "home") });
}

const FILM: { src: string; caption: L }[] = [
  { src: "/images/cut-mulet.jpg", caption: { de: "Moderne Mulet", fr: "Mulet moderne", en: "Modern mullet" } },
  { src: "/images/cut-standard.jpg", caption: { de: "The GYAN Standard", fr: "The GYAN Standard", en: "The GYAN Standard" } },
  { src: "/images/cut-fade.jpg", caption: { de: "Low Fade, sauber verblendet", fr: "Low fade, dégradé net", en: "Low fade, cleanly blended" } },
  { src: "/images/salon-spiegel.jpg", caption: { de: "Skulpturale Spiegel", fr: "Miroirs sculpturaux", en: "Sculptural mirrors" } },
  { src: "/images/signatur.jpg", caption: { de: "Die Handschrift von Zana", fr: "La signature de Zana", en: "Zana's signature" } },
  { src: "/images/salon-lounge.jpg", caption: { de: "Die Lounge", fr: "Le lounge", en: "The lounge" } },
  { src: "/images/salon-wasch.jpg", caption: { de: "Pflege & Wäsche", fr: "Soin & shampoing", en: "Wash & care" } },
];

export default async function Home({ params }: Props) {
  const locale = (await params).lang as Lc;
  const d = getDict(locale);
  const h = d.home;
  const [services, hours] = await Promise.all([getServices(), getSalonHours()]);
  const local = services.map((s) => localize(s, locale));
  return (
    <>
      <Intro line={d.intro.line} />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-head">
            <div className="hero-top hero-in" style={{ ["--i" as string]: 0 }}>
              <h1 className="eyebrow">{h.heroEyebrow}</h1>
              <LiveChip locale={locale} />
            </div>
            <p className="hero-title">
              <span className="line">
                <span className="line-in" style={{ ["--i" as string]: 1 }}>{h.heroTitle.lead}</span>
              </span>
              <span className="line">
                <span className="line-in rot" style={{ ["--i" as string]: 2, ["--n" as string]: h.heroTitle.words.length }}>
                  <span className="sr-only">{h.heroTitle.words[0]}</span>
                  {h.heroTitle.words.map((w, i) => (
                    <span className="rot-word" aria-hidden key={w} style={{ ["--w" as string]: i }}>{w}</span>
                  ))}
                </span>
              </span>
              <span className="line">
                <span className="line-in" style={{ ["--i" as string]: 3 }}>{h.heroTitle.tail}</span>
              </span>
            </p>
          </div>
          <div className="hero-body">
            <p className="hero-text hero-in" style={{ ["--i" as string]: 4 }}>{h.heroText}</p>
            <div className="btn-row hero-in" style={{ ["--i" as string]: 5 }}>
              <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
              <Link className="btn btn-light" href={href(locale, "services")}>{d.common.allServices}</Link>
            </div>
            <a className="hero-rating hero-in" style={{ ["--i" as string]: 6 }} href={site.googleReviewsUrl} target="_blank" rel="noopener">
              <span className="stars" aria-hidden>★★★★★</span>
              <strong>{site.rating.value}</strong>
              <span>· {site.rating.count} {d.common.reviews} {d.common.rating}</span>
            </a>
          </div>

          <div className="hero-visual">
            <div className="hero-arch">
              <Image src={site.images.hero} alt={site.imageAlt[site.images.hero][locale]} fill priority sizes="(max-width: 900px) 80vw, 40vw" />
            </div>
            <div className="hero-small">
              <Image src="/images/hero-fade.jpg" alt={site.imageAlt["/images/hero-fade.jpg"][locale]} fill sizes="(max-width: 900px) 40vw, 18vw" />
            </div>
            <div className="hero-badge" aria-hidden>
              <svg viewBox="0 0 100 100" className="badge-ring">
                <defs>
                  <path id="badge-circle" d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
                </defs>
                <text>
                  <textPath href="#badge-circle" textLength="250" lengthAdjust="spacing">{h.heroBadge}</textPath>
                </text>
              </svg>
              <Wordmark className="badge-mono" />
            </div>
            <Link className="hero-slot" href={href(locale, "booking")}>
              <span className="sticky-dot" aria-hidden />
              <span className="hero-slot-text">
                <small>{d.home.live.next}</small>
                <LiveSlot locale={locale} fallback={d.home.live.none} />
                <span className="hero-slot-walkin">{d.home.live.walkin}</span>
              </span>
              <span className="hero-slot-go" aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="marquee" aria-hidden>
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div className="marquee-group" key={k}>
                {local.map((s) => (
                  <span key={s.id}>
                    {s.name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section statement" id="start">
        <div className="container narrow center">
          <Words as="h2" className="statement-text" text={h.statement} />
          <p className="lead statement-soft" data-reveal>{h.statementSoft}</p>
        </div>
      </section>

      <section className="section story">
        <div className="container story-grid">
          <div className="story-media" data-progress>
            <div className="sweep">
              <div className="story-img">
                <Image src={site.images.zanaMain} alt={site.imageAlt[site.images.zanaMain][locale]} fill sizes="(max-width: 900px) 90vw, 45vw" />
              </div>
            </div>
            <div className="story-inset sweep-slow">
              <Image src={site.images.zana} alt={site.imageAlt[site.images.zana][locale]} fill sizes="260px" />
            </div>
          </div>
          <div className="story-text" data-reveal>
            <p className="eyebrow">{h.storyEyebrow}</p>
            <h2 className="h-display">{h.storyTitle}</h2>
            <p className="lead">{h.storyText}</p>
            <blockquote className="quote">
              <p>«{h.quote}»</p>
              <cite>{h.quoteBy}</cite>
            </blockquote>
            <Signature className="signature" label={d.zana.signature} />
            <Link className="arrow-link" href={href(locale, "zana")}>{h.storyLink} →</Link>
          </div>
        </div>
      </section>

      <section className="section promises bg-cream">
        <div className="container">
          <SectionHead eyebrow={h.promisesEyebrow} title={h.promisesTitle} />
          <ol className="promise-grid">
            {h.promises.map((p, i) => (
              <li key={p.title} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="promise-no">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section services-home">
        <div className="container">
          <SectionHead eyebrow={h.servicesEyebrow} title={h.servicesTitle} />
          <ServiceRows services={local} locale={locale} d={d} feature />
          <div className="btn-row" data-reveal>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
            <Link className="btn btn-light" href={href(locale, "services")}>{d.common.allServices}</Link>
          </div>
        </div>
      </section>

      <Filmstrip
        label={h.workTitle}
        head={
          <div className="film-headline">
            <div>
              <p className="eyebrow">{h.workEyebrow}</p>
              <h2 className="h2">{h.workTitle}</h2>
            </div>
            <a className="arrow-link" href={site.instagram} target="_blank" rel="noopener">{h.workCta} →</a>
          </div>
        }
        items={FILM.map((f) => ({ src: f.src, alt: site.imageAlt[f.src]?.[locale] ?? f.caption[locale], caption: f.caption[locale] }))}
      />

      <section className="section ways">
        <div className="container">
          <SectionHead eyebrow={h.waysEyebrow} title={h.waysTitle} center />
          <div className="ways-grid">
            <div className="way way-accent" data-reveal>
              <span className="way-tag">{d.common.withZana}</span>
              <h3 className="h2">{h.wayBookTitle}</h3>
              <p>{h.wayBookText}</p>
              <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.book}</Link>
            </div>
            <div className="way" data-reveal style={{ transitionDelay: "120ms" }}>
              <span className="way-tag">{d.common.walkIn}</span>
              <h3 className="h2">{h.wayWalkTitle}</h3>
              <p>{h.wayWalkText}</p>
              <Link className="btn btn-light" href={href(locale, "contact")}>{h.wayWalkCta}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section salon-teaser bg-cream">
        <div className="container salon-grid">
          <div className="salon-copy" data-reveal>
            <p className="eyebrow">{h.salonEyebrow}</p>
            <h2 className="h2">{h.salonTitle}</h2>
            <p className="lead">{h.salonText}</p>
            <Link className="arrow-link" href={href(locale, "salon")}>{h.salonCta} →</Link>
          </div>
          <div className="salon-mosaic">
            {[site.images.lounge, site.images.reception, site.images.wash].map((src, i) => (
              <div key={src} className={`mosaic-${i}`} data-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="parallax-img" data-parallax={String(0.05 + i * 0.05)}>
                  <Image src={src} alt={site.imageAlt[src][locale]} fill sizes="(max-width: 900px) 50vw, 25vw" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section reviews">
        <div className="container narrow center" data-reveal>
          <p className="rating-big">{site.rating.value}</p>
          <p className="stars stars-lg" aria-hidden>★★★★★</p>
          <h2 className="h2">{h.reviewsTitle}</h2>
          <p className="lead">{h.reviewsText}</p>
          <div className="btn-row reviews-btns">
            <a className="btn btn-light" href={site.googleReviewsUrl} target="_blank" rel="noopener">{h.reviewsCta}</a>
            <a className="btn btn-dark" href={site.googleWriteReviewUrl} target="_blank" rel="noopener">★ {h.reviewsWrite}</a>
          </div>
        </div>
      </section>

      <section className="section journal bg-cream">
        <div className="container">
          <div className="section-head-row">
            <SectionHead eyebrow={h.journalEyebrow} title={h.journalTitle} />
            <Link className="arrow-link" href={href(locale, "blog")}>{d.nav.blog} →</Link>
          </div>
          <div className="post-grid">
            {posts.slice(0, 3).map((p, i) => (
              <PostCard key={p.key} post={p} locale={locale} d={d} delay={i * 90} />
            ))}
          </div>
        </div>
      </section>

      <Visit locale={locale} d={d} hours={hours} />
      <CtaBand locale={locale} d={d} />
    </>
  );
}
