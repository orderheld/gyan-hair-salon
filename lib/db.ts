import "server-only";
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { CATALOG_VERSION, syncCatalog } from "./catalog";
import { MIGRATIONS } from "./migrations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Sql = ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>) & {
  /** Abfrage mit fertigem Text und $1, $2 … Platzhaltern */
  query: (text: string, params?: unknown[]) => Promise<Row[]>;
};

/** Fingerabdruck aller Migrationen und der Preislisten-Version */
const SCHEMA_HASH = createHash("sha1").update(MIGRATIONS.join(";") + "|" + CATALOG_VERSION).digest("hex").slice(0, 16);

const globalForDb = globalThis as unknown as { __gyanSql?: Promise<Sql> };

/**
 * Liefert die Datenbankverbindung.
 * Mit DATABASE_URL: Neon (Produktion und lokal).
 * Ohne DATABASE_URL im Entwicklungsmodus: eine lokale Test-Datenbank (PGlite) im Ordner .pglite,
 * damit "npm run dev" sofort ohne Neon-Konto funktioniert.
 */
export function getSql(): Promise<Sql> {
  if (!globalForDb.__gyanSql) {
    globalForDb.__gyanSql = createSql().catch((error) => {
      globalForDb.__gyanSql = undefined;
      throw error;
    });
  }
  return globalForDb.__gyanSql;
}

async function createSql(): Promise<Sql> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const client = neon(url);
    // Schema und Preisliste nur nachziehen, wenn sich etwas geändert hat.
    // Sonst kostet ein Kaltstart nur diese eine kleine Abfrage statt aller Migrationen.
    const current = await client.query(`SELECT value FROM settings WHERE key = 'schema_hash'`).catch(() => []) as Row[];
    if (current[0]?.value !== SCHEMA_HASH) {
      await client.transaction(MIGRATIONS.map((statement) => client.query(statement))); // eine Anfrage
      await syncCatalog((text, params = []) => client.query(text, params) as Promise<Row[]>);
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('schema_hash', $1::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now()`,
        [JSON.stringify(SCHEMA_HASH)],
      );
    }
    const tagged = (strings: TemplateStringsArray, ...values: unknown[]) => client(strings, ...values) as Promise<Row[]>;
    return Object.assign(tagged, { query: (text: string, params: unknown[] = []) => client.query(text, params) as Promise<Row[]> });
  }
  if (process.env.NODE_ENV === "production" && !process.env.GYAN_LOCAL_DB) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }
  return createLocalSql();
}

async function createLocalSql(): Promise<Sql> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const { seed } = await import("@/db/seed.mjs");
  const { btree_gist } = await import("@electric-sql/pglite/contrib/btree_gist");
  const db = new PGlite(path.join(process.cwd(), ".pglite"), { extensions: { btree_gist } });
  await db.exec(await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
  for (const statement of MIGRATIONS) await db.exec(statement);
  await seed(async (text, params) => (await db.query(text, params)).rows);
  await syncCatalog(async (text, params = []) => (await db.query<Row>(text, params)).rows);
  console.log("[GYAN] Lokale Test-Datenbank (.pglite) aktiv. Für Neon DATABASE_URL setzen.");
  const query = async (text: string, params: unknown[] = []) => (await db.query<Row>(text, params)).rows;
  const tagged = (strings: TemplateStringsArray, ...values: unknown[]) => query(strings.reduce((acc, part, i) => acc + "$" + i + part), values);
  return Object.assign(tagged, { query });
}

/** Postgres-Fehlercode der Exclusion-Constraint (Überschneidung). */
export function isOverlapError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return e?.code === "23P01" || /bookings_no_overlap/.test(e?.message ?? "");
}
