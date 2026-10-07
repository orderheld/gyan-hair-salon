// Vorschläge für Google-Bewertungen: Namensähnlichkeit ohne Datenbank.
// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { maskEmail, nameScore, nameTokens, searchCards, suggestCards } from "../lib/review-match.ts";

const card = (id, name, email, reviewGiven = false) => ({ id, name, email, token: `t${id}`, reviewGiven });
const cards = [
  card(1, "Lukas Meier", "lukas.meier@gmail.com"),
  card(2, "Zoë Müller-Brand", "zoe@example.ch"),
  card(3, "Lukas Steiner", "steiner@bluewin.ch", true),
  card(4, "", "sarah.keller@gmx.ch"),
  card(5, "Nora Rossi", "nora@example.ch"),
];

test("Namen normalisieren: klein, ohne Akzente, ß, Bindestrich, Punkte", () => {
  assert.deepEqual(nameTokens("  Zoë  MÜLLER-Brand "), ["zoe", "muller", "brand"]);
  assert.deepEqual(nameTokens("Sarah K."), ["sarah", "k"]);
  assert.deepEqual(nameTokens("Strauß"), ["strauss"]);
  assert.deepEqual(nameTokens(""), []);
});

test("Vor- und Nachname schlagen nur den Vornamen", () => {
  const full = nameScore(nameTokens("Lukas Meier"), nameTokens("Lukas Meier"));
  const first = nameScore(nameTokens("Lukas Meier"), nameTokens("Lukas Steiner"));
  assert.equal(full, 100);
  assert.ok(first > 0 && first < full);
  assert.equal(nameScore(nameTokens("LUKAS MEIER"), nameTokens("lukas meier")), 100);
  assert.equal(nameScore(nameTokens("Meier Lukas"), nameTokens("Lukas Meier")), 90);
  assert.equal(nameScore(nameTokens("Zoe Muller"), nameTokens("Zoë Müller-Brand")), 100);
  assert.equal(nameScore(nameTokens("Lucas Meier"), nameTokens("Lukas Meier")), 100, "ein Tippfehler bei längeren Namen");
  assert.equal(nameScore(nameTokens("Peter Huber"), nameTokens("Lukas Meier")), 0);
});

test("Vorschläge: höchstens 3, beste zuerst, E-Mail als Ersatz für fehlenden Namen", () => {
  const s = suggestCards("Lukas Meier", cards);
  assert.equal(s[0].id, 1);
  assert.ok(s.length <= 3);
  assert.ok(s.some((c) => c.id === 3), "nur Vorname passt: schwächerer Vorschlag");
  assert.equal(suggestCards("Sarah Keller", cards)[0].id, 4);
  assert.equal(suggestCards("Sarah K.", cards)[0]?.id, 4);
  assert.deepEqual(suggestCards("Ein Google-Nutzer", cards), []);
  assert.deepEqual(suggestCards("", cards), []);
});

test("Suche von Hand und gekürzte E-Mail", () => {
  assert.deepEqual(searchCards("rossi", cards).map((c) => c.id), [5]);
  assert.deepEqual(searchCards("bluewin", cards).map((c) => c.id), [3]);
  assert.deepEqual(searchCards("", cards), []);
  assert.equal(maskEmail("lukas.meier@gmail.com"), "lu•••@gmail.com");
  assert.equal(maskEmail("a@b.ch"), "a•••@b.ch");
});
