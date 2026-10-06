import "server-only";
import { neon } from "@neondatabase/serverless";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

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
    return (strings, ...values) => client(strings, ...values) as Promise<Row[]>;
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
  const db = new PGlite(path.join(process.cwd(), ".pglite"));
  await db.exec(await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
  await seed(async (text, params) => (await db.query(text, params)).rows);
  console.log("[GYAN] Lokale Test-Datenbank (.pglite) aktiv. Für Neon DATABASE_URL setzen.");
  return async (strings, ...values) => {
    const text = strings.reduce((acc, part, i) => acc + "$" + i + part);
    const result = await db.query<Row>(text, values);
    return result.rows;
  };
}

/** Postgres-Fehlercode der Exclusion-Constraint (Überschneidung). */
export function isOverlapError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return e?.code === "23P01" || /bookings_no_overlap/.test(e?.message ?? "");
}
