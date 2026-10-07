// SEO-Prüfung aller Seiten aus der Sitemap: Titel, Beschreibung, H1, Canonical, hreflang, Teilen-Bild, Bild-Alt, Doppelte.
// Aufruf mit laufendem Server:  node scripts/seo-check.mjs http://localhost:3000
const base = process.argv[2] || "http://localhost:3000";
const sm = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const dec = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const meta = (h, attr, key) => dec(h.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`, "i"))?.[1]);

const pages = [];
for (let i = 0; i < paths.length; i += 4) {
  await Promise.all(paths.slice(i, i + 4).map(async (p) => {
    const r = await fetch(base + p);
    const h = await r.text();
    const body = h.split("<body")[1] ?? "";
    pages.push({
      p, status: r.status,
      title: dec(h.match(/<title>([^<]*)<\/title>/)?.[1]),
      desc: meta(h, "name", "description"),
      canonical: h.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1],
      ogImage: meta(h, "property", "og:image"), ogTitle: meta(h, "property", "og:title"), twCard: meta(h, "name", "twitter:card"),
      hreflang: (h.match(/hrefLang=|hreflang=/gi) ?? []).length,
      h1: (body.match(/<h1[\s>]/g) ?? []).length,
      imgNoAlt: (body.match(/<img(?![^>]*\balt=)[^>]*>/g) ?? []).length,
      jsonLd: h.includes("application/ld+json"),
    });
  }));
}

const issues = [];
const add = (p, msg) => issues.push(`${p}: ${msg}`);
for (const x of pages) {
  if (x.status !== 200) add(x.p, `Status ${x.status}`);
  if (!x.title) add(x.p, "kein Titel");
  else if (x.title.length > 60) add(x.p, `Titel ${x.title.length} Zeichen (max 60)`);
  else if (x.title.length < 25) add(x.p, `Titel nur ${x.title.length} Zeichen`);
  if (!x.desc) add(x.p, "keine Beschreibung");
  else if (x.desc.length > 160) add(x.p, `Beschreibung ${x.desc.length} Zeichen (max 160)`);
  else if (x.desc.length < 100) add(x.p, `Beschreibung nur ${x.desc.length} Zeichen`);
  if (x.desc?.endsWith("…")) add(x.p, "Beschreibung abgeschnitten");
  if (x.h1 !== 1) add(x.p, `${x.h1} H1`);
  if (!x.canonical?.endsWith(x.p)) add(x.p, `Canonical ${x.canonical}`);
  if (x.hreflang < 4) add(x.p, "hreflang fehlt");
  if (!x.ogImage || !x.ogTitle || !x.twCard) add(x.p, "Teilen-Vorschau unvollständig");
  if (x.imgNoAlt) add(x.p, `${x.imgNoAlt} Bild(er) ohne alt`);
  if (!x.jsonLd) add(x.p, "kein JSON-LD");
}
for (const key of ["title", "desc"]) {
  const seen = new Map();
  for (const x of pages) if (x[key]) seen.set(x[key], [...(seen.get(x[key]) ?? []), x.p]);
  for (const [v, ps] of seen) if (ps.length > 1) issues.push(`doppelt (${key}): ${ps.join(", ")} → ${v.slice(0, 60)}`);
}
console.log(`${pages.length} Seiten geprüft, ${issues.length} Befunde`);
for (const i of issues) console.log(" - " + i);
process.exitCode = issues.length ? 1 : 0;
