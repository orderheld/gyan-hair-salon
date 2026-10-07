import { getSql } from "@/lib/db";

const T = {
  de: { title: "Technik", server: "Server-Standort", db: "Datenbank-Standort", ping: "Antwortzeit Datenbank", match: "Server und Datenbank sollten in derselben Region liegen (z. B. Frankfurt: fra1 und eu-central-1)." },
  fr: { title: "Technique", server: "Emplacement du serveur", db: "Emplacement de la base de données", ping: "Temps de réponse base de données", match: "Le serveur et la base de données devraient être dans la même région (p. ex. Francfort : fra1 et eu-central-1)." },
  en: { title: "Technical", server: "Server location", db: "Database location", ping: "Database response time", match: "Server and database should be in the same region (e.g. Frankfurt: fra1 and eu-central-1)." },
};

/** Zeigt, wo Server und Datenbank laufen und wie schnell die Datenbank antwortet. */
export async function TechStatus({ locale }: { locale: string }) {
  const t = T[locale as keyof typeof T] ?? T.de;
  const server = process.env.VERCEL_REGION ?? "lokal";
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL ?? "").hostname;
    } catch {
      return "";
    }
  })();
  // z. B. ep-xyz-pooler.eu-central-1.aws.neon.tech → eu-central-1
  const db = host.match(/\.([a-z]{2}-[a-z]+-\d)\./)?.[1] ?? (host ? host.split(".").slice(1, -2).join(".") : "lokal");
  const sql = await getSql();
  const times: number[] = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await sql`SELECT 1`;
    times.push(Math.round(performance.now() - start));
  }
  const ms = times.sort((a, b) => a - b)[1];
  return (
    <section className="panel stack">
      <h2 className="h3">{t.title}</h2>
      <p className="small" style={{ margin: 0 }}>{t.server}: <strong>{server}</strong> · {t.db}: <strong>{db}</strong> · {t.ping}: <strong>{ms} ms</strong></p>
      <p className="muted small" style={{ margin: 0 }}>{t.match}</p>
    </section>
  );
}
