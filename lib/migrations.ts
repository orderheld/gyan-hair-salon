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
  // Kasse (Oktober 2026): Team, Produkte und Belege
  `CREATE TABLE IF NOT EXISTS staff (
    id     text PRIMARY KEY,
    name   text NOT NULL,
    sort   integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true
  )`,
  `INSERT INTO staff (id, name, sort) VALUES ('zana', 'Zana', 1), ('hikmet', 'Hikmet', 2), ('staff3', 'Mitarbeiter 3', 3) ON CONFLICT (id) DO NOTHING`,
  `CREATE TABLE IF NOT EXISTS pos_products (
    id        serial PRIMARY KEY,
    name      text NOT NULL,
    price_chf numeric(8,2) NOT NULL CHECK (price_chf >= 0),
    active    boolean NOT NULL DEFAULT true,
    sort      integer NOT NULL DEFAULT 0
  )`,
  // Belege: fortlaufend nummeriert, mit Prüfsumme verkettet, nie änderbar (Korrektur nur per Storno-Beleg)
  `CREATE TABLE IF NOT EXISTS pos_sales (
    no         integer PRIMARY KEY,
    created_at timestamptz NOT NULL,
    staff_id   text NOT NULL,
    staff_name text NOT NULL,
    payment    text NOT NULL CHECK (payment IN ('cash', 'card', 'twint')),
    items      jsonb NOT NULL,
    total_chf  numeric(10,2) NOT NULL,
    vat_rate   numeric(4,2) NOT NULL DEFAULT 0,
    vat_chf    numeric(10,2) NOT NULL DEFAULT 0,
    given_chf  numeric(10,2),
    booking_id uuid,
    storno_of  integer REFERENCES pos_sales(no),
    note       text NOT NULL DEFAULT '',
    prev_hash  text NOT NULL,
    hash       text NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS pos_sales_storno_idx ON pos_sales (storno_of) WHERE storno_of IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS pos_sales_created_idx ON pos_sales (created_at)`,
  `CREATE OR REPLACE FUNCTION pos_sales_locked() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Kassenbelege können nicht geändert oder gelöscht werden'; END $$`,
  `CREATE OR REPLACE TRIGGER pos_sales_lock BEFORE UPDATE OR DELETE ON pos_sales FOR EACH ROW EXECUTE FUNCTION pos_sales_locked()`,
  `CREATE OR REPLACE TRIGGER pos_sales_no_truncate BEFORE TRUNCATE ON pos_sales FOR EACH STATEMENT EXECUTE FUNCTION pos_sales_locked()`,
];
