// Journal: jeder Artikel hat ein eigenes Bild, und nur eigene Salon-Fotos aus /public/images (Wunsch Ferhat).
// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const dir = new URL("../content/blog/", import.meta.url);
const images = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts").map((f) => [f, readFileSync(new URL(f, dir), "utf8").match(/image:\s*"([^"]+)"/)?.[1]]);

// Ausschnitte zählen als dasselbe Foto (site.images.large: Ausschnitt -> Original), gleiche Dateien ebenso
const site = readFileSync(new URL("../content/site.ts", import.meta.url), "utf8");
const crops = Object.fromEntries([...(site.match(/large:\s*\{([^}]*)\}/)?.[1] ?? "").matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
const photo = (img) => {
  const src = crops[img] ?? img;
  const file = new URL(`../public${src}`, import.meta.url);
  return existsSync(file) ? createHash("sha1").update(readFileSync(file)).digest("hex") : src;
};

test("jeder Journal-Artikel hat ein anderes Foto (auch kein Ausschnitt desselben Fotos)", () => {
  const seen = new Map();
  for (const [file, img] of images) {
    assert.ok(img, `${file}: kein Bild`);
    const id = photo(img);
    assert.ok(!seen.has(id), `${file} und ${seen.get(id)} zeigen dasselbe Foto (${img})`);
    seen.set(id, file);
  }
});

test("nur eigene Bilder aus /public/images", () => {
  for (const [file, img] of images) {
    assert.match(img, /^\/images\/[\w-]+\.(jpg|png|webp)$/, `${file}: ${img}`);
    assert.ok(existsSync(new URL(`../public${img}`, import.meta.url)), `${file}: ${img} fehlt`);
  }
});
