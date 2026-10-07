// Journal: jeder Artikel hat ein eigenes Bild, und nur eigene Salon-Fotos aus /public/images (Wunsch Ferhat).
// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const dir = new URL("../content/blog/", import.meta.url);
const images = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => [f, readFileSync(new URL(f, dir), "utf8").match(/image:\s*"([^"]+)"/)?.[1]]);

test("jeder Journal-Artikel hat ein anderes Bild", () => {
  const seen = new Map();
  for (const [file, img] of images) {
    assert.ok(img, `${file}: kein Bild`);
    assert.ok(!seen.has(img), `${file} und ${seen.get(img)} nutzen beide ${img}`);
    seen.set(img, file);
  }
});

test("nur eigene Bilder aus /public/images", () => {
  for (const [file, img] of images) {
    assert.match(img, /^\/images\/[\w-]+\.(jpg|png|webp)$/, `${file}: ${img}`);
    assert.ok(existsSync(new URL(`../public${img}`, import.meta.url)), `${file}: ${img} fehlt`);
  }
});
