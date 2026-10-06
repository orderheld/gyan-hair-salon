// Richtet die Neon-Datenbank ein: Tabellen anlegen und Startdaten einfügen.
// Aufruf (PowerShell):  npm run db:setup
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { seed, splitSql } from "../db/seed.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL fehlt. Bitte in .env.local eintragen.");
  process.exit(1);
}
const sql = neon(url);
const query = (text, params = []) => sql.query(text, params);

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
for (const statement of splitSql(schema)) await query(statement);
console.log("✓ Tabellen angelegt");
await seed(query);
console.log("✓ Leistungen und Öffnungszeiten eingefügt");
console.log("Datenbank ist bereit.");
