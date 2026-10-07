// Erzeugt das Teilen-Bild (WhatsApp, Facebook, LinkedIn, X) je Sprache: 1200 × 630, links Logo und Text, rechts Salonfoto.
// Aufruf nach Text- oder Bildänderungen:  node scripts/og-share.mjs
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const W = 1200;
const H = 630;
const PANEL = 560;
const photo = new URL("../public/images/salon-spiegel.jpg", import.meta.url).pathname;
const favicon = await readFile(new URL("../public/icons/favicon.svg", import.meta.url), "utf8");
// Nur das Logozeichen (inneres SVG) aus dem Favicon
const mark = favicon.match(/<svg x="9"[\s\S]*?<\/svg>/)[0].replace(/x="9" y="17" width="46" height="30"/, 'x="72" y="70" width="120" height="78"');

const TEXT = {
  de: { line1: "Herren Coiffeur", line2: "& Barbier in Biel", sub: "Zentralstrasse 22 · Biel/Bienne", cta: "Online Termin buchen · sofort bestätigt" },
  fr: { line1: "Coiffeur homme", line2: "& barbier à Bienne", sub: "Zentralstrasse 22 · Biel/Bienne", cta: "Réserve en ligne · confirmé tout de suite" },
  en: { line1: "Men's hairdresser", line2: "& barber in Biel", sub: "Zentralstrasse 22 · Biel/Bienne", cta: "Book online · confirmed instantly" },
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const right = await sharp(photo).resize(W - PANEL, H, { fit: "cover", position: "centre" }).toBuffer();

for (const [lang, t] of Object.entries(TEXT)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL}" height="${H}">
  <rect width="100%" height="100%" fill="#fbf8f3"/>
  ${mark}
  <text x="72" y="196" font-family="Inter" font-weight="600" font-size="22" letter-spacing="7" fill="#6b5b4b">GYAN HAIR SALON</text>
  <text x="70" y="320" font-family="Inter Display" font-weight="600" font-size="54" fill="#2a2622">${esc(t.line1)}</text>
  <text x="70" y="386" font-family="Inter Display" font-weight="600" font-size="54" fill="#2a2622">${esc(t.line2)}</text>
  <text x="72" y="446" font-family="Inter" font-size="26" fill="#6c645a">${esc(t.sub)}</text>
  <rect x="72" y="500" width="${PANEL - 144}" height="2" fill="#e6dccd"/>
  <text x="72" y="552" font-family="Inter" font-weight="500" font-size="24" fill="#6b5b4b">${esc(t.cta)}</text>
</svg>`;
  await sharp({ create: { width: W, height: H, channels: 3, background: "#fbf8f3" } })
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }, { input: right, left: PANEL, top: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(new URL(`../public/og/share-${lang}.jpg`, import.meta.url).pathname);
  console.log(`og/share-${lang}.jpg`);
}
