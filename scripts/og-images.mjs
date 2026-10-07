// Erzeugt Vorschaubilder für Social Media (Open Graph, 1200 × 630) aus public/images.
// Die Fotos sind Hochformat, Facebook, WhatsApp und LinkedIn zeigen aber Querformat.
// Aufruf nach neuen Bildern:  node scripts/og-images.mjs
import { readdir } from "node:fs/promises";
import sharp from "sharp";

const W = 1200;
const H = 630;
const src = new URL("../public/images/", import.meta.url);
const out = new URL("../public/og/", import.meta.url);

// Wo im Hochformat das Wichtige liegt (0 = oben, 1 = unten). Ohne Eintrag: automatisch.
const FOCUS = {
  "salon-spiegel.jpg": 0.42,
  "salon-lounge.jpg": 0.45,
  "salon-wasch.jpg": 0.6,
  "salon-empfang.jpg": 0.42,
  "salon-empfang-2.jpg": 0.42,
  "zana-barbershop.jpg": 0.62,
  "signatur.jpg": 0.4,
  "cut-standard.jpg": 0.45,
  "cut-mulet.jpg": 0.52,
  "hero-fade.jpg": 0.35,
};

for (const file of await readdir(src)) {
  if (!/\.jpe?g$/i.test(file)) continue;
  const path = new URL(file, src).pathname;
  const target = new URL(file.replace(/\.jpe?g$/i, ".jpg"), out).pathname;
  const { width, height } = await sharp(path).metadata();
  let img = sharp(path);
  if (FOCUS[file] != null && height / width > H / W) {
    const scaled = Math.round((height * W) / width);
    const top = Math.max(0, Math.min(scaled - H, Math.round(FOCUS[file] * scaled - H / 2)));
    img = img.resize(W).extract({ left: 0, top, width: W, height: H });
  } else {
    img = img.resize(W, H, { fit: "cover", position: sharp.strategy.attention });
  }
  await img.jpeg({ quality: 80, mozjpeg: true }).toFile(target);
  console.log("og/" + file);
}
