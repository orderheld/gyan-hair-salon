// Ergänzungen am Schema, die bei jedem Start automatisch (idempotent) nachgezogen werden.
// So muss nach einem Update niemand "npm run db:setup" erneut ausführen.
// Dieselben Anweisungen stehen auch am Ende von db/schema.sql.
export const MIGRATIONS = [
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS no_show boolean NOT NULL DEFAULT false`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false`,
  // zu spät storniert oder nicht gekommen: Kosten offen, bis das Admin «verrechnet» antippt
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS late_cancel boolean NOT NULL DEFAULT false`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fee_open boolean NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS customers (
    key          text PRIMARY KEY,
    note         text NOT NULL DEFAULT '',
    blocked      boolean NOT NULL DEFAULT false,
    no_marketing boolean NOT NULL DEFAULT false,
    updated_at   timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS email_codes (
    email        text PRIMARY KEY,
    code_hash    text NOT NULL,
    expires_at   timestamptz NOT NULL,
    attempts     integer NOT NULL DEFAULT 0,
    sends        integer NOT NULL DEFAULT 1,
    window_start timestamptz NOT NULL DEFAULT now(),
    last_sent_at timestamptz NOT NULL DEFAULT now()
  )`,
  // Preisliste: Preis ohne Termin, Gruppe (Haarschnitt, Bart, Face, Pakete) und «Beliebt»
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS walkin_price_chf numeric(8,2)`,
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'cut'`,
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS popular boolean NOT NULL DEFAULT false`,
  `CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (lower(customer_email))`,
  // Push-Benachrichtigungen (Admin: neue Buchungen; Kunden: Bestätigung, Erinnerung, Dankeschön)
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint     text PRIMARY KEY,
    p256dh       text NOT NULL,
    auth         text NOT NULL,
    role         text NOT NULL CHECK (role IN ('admin', 'customer')),
    customer_key text NOT NULL DEFAULT '',
    locale       text NOT NULL DEFAULT 'de',
    created_at   timestamptz NOT NULL DEFAULT now(),
    last_ok_at   timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS push_customer_idx ON push_subscriptions (customer_key)`,
  // Geburtsdatum (JJJJ-MM-TT), bei Online-Buchungen Pflicht
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS birth_date text NOT NULL DEFAULT ''`,
  // Oktober 2026: Zana online nur Dienstag bis Samstag (einmalig, danach im Admin frei änderbar)
  `UPDATE opening_hours SET is_open = false WHERE weekday = 1 AND NOT EXISTS (SELECT 1 FROM settings WHERE key = 'zanaTueSat')`,
  `INSERT INTO settings (key, value) VALUES ('zanaTueSat', 'true'::jsonb) ON CONFLICT (key) DO NOTHING`,
];
