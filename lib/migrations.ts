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
  // Team (Oktober 2026): Termine, buchbare Zeiten und Sperren pro Mitarbeiter
  `CREATE EXTENSION IF NOT EXISTS btree_gist`,
  `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS staff_id text NOT NULL DEFAULT 'zana'`,
  // Doppelbuchungen nur noch pro Mitarbeiter verhindern (Zana und Hikmet dürfen gleichzeitig)
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap' AND pg_get_constraintdef(oid) LIKE '%staff_id%') THEN
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
      ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, busy_until, '[)') WITH &&) WHERE (status = 'confirmed');
    END IF;
  END $$`,
  // Sperren: leer = ganzes Geschäft, sonst nur dieser Mitarbeiter
  `ALTER TABLE blocked_times ADD COLUMN IF NOT EXISTS staff_id text`,
  `CREATE TABLE IF NOT EXISTS staff_hours (
    staff_id    text NOT NULL,
    weekday     integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    is_open     boolean NOT NULL DEFAULT true,
    open_time   time NOT NULL DEFAULT '09:00',
    close_time  time NOT NULL DEFAULT '19:00',
    break_start time,
    break_end   time,
    PRIMARY KEY (staff_id, weekday),
    CHECK (close_time > open_time)
  )`,
  // Zana übernimmt die bisherigen buchbaren Zeiten, Hikmet startet mit den Öffnungszeiten des Salons
  `INSERT INTO staff_hours (staff_id, weekday, is_open, open_time, close_time, break_start, break_end)
   SELECT 'zana', weekday, is_open, open_time, close_time, break_start, break_end FROM opening_hours
   ON CONFLICT (staff_id, weekday) DO NOTHING`,
  `INSERT INTO staff_hours (staff_id, weekday, is_open, open_time, close_time) VALUES
   ('hikmet', 0, false, '09:00', '18:00'), ('hikmet', 1, true, '09:00', '19:00'), ('hikmet', 2, true, '09:00', '19:00'),
   ('hikmet', 3, true, '09:00', '19:00'), ('hikmet', 4, true, '09:00', '20:00'), ('hikmet', 5, true, '09:00', '20:00'),
   ('hikmet', 6, true, '08:30', '18:00')
   ON CONFLICT (staff_id, weekday) DO NOTHING`,
  // Stempelkarte (Oktober 2026): Karte pro Kunde (E-Mail), Stempel-Protokoll nur anhängen, Empfehlungen
  `CREATE TABLE IF NOT EXISTS loyalty_cards (
    id                     serial PRIMARY KEY,
    customer_key           text NOT NULL UNIQUE,
    token                  text NOT NULL UNIQUE,
    ref_code               text NOT NULL UNIQUE,
    name                   text NOT NULL DEFAULT '',
    birth_date             text NOT NULL DEFAULT '',
    birthday_notified_year integer,
    created_at             timestamptz NOT NULL DEFAULT now()
  )`,
  // seq ist pro Karte fortlaufend: zwei gleichzeitige Buchungen auf dieselbe Karte schliessen sich aus (kein Doppelstempel)
  `CREATE TABLE IF NOT EXISTS loyalty_stamps (
    id          bigserial PRIMARY KEY,
    card_id     integer NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    seq         integer NOT NULL,
    kind        text NOT NULL CHECK (kind IN ('visit', 'referral', 'review', 'birthday', 'redeem', 'correction')),
    delta       integer NOT NULL,
    actor       text NOT NULL DEFAULT '',
    reason      text NOT NULL DEFAULT '',
    ref_card_id integer,
    year        integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (card_id, seq)
  )`,
  `CREATE INDEX IF NOT EXISTS loyalty_stamps_created_idx ON loyalty_stamps (created_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS loyalty_stamps_review_once ON loyalty_stamps (card_id) WHERE kind = 'review'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS loyalty_stamps_birthday_once ON loyalty_stamps (card_id, year) WHERE kind = 'birthday'`,
  // Einträge sind nie änderbar; Löschen nur mit der ganzen Karte (Datenschutz)
  `CREATE OR REPLACE FUNCTION loyalty_stamps_locked() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Stempel können nicht geändert werden (Korrektur nur als neuer Eintrag)'; END $$`,
  `CREATE OR REPLACE TRIGGER loyalty_stamps_lock BEFORE UPDATE ON loyalty_stamps FOR EACH ROW EXECUTE FUNCTION loyalty_stamps_locked()`,
  `CREATE TABLE IF NOT EXISTS loyalty_referrals (
    referred_card_id integer PRIMARY KEY REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    referrer_card_id integer NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    created_at       timestamptz NOT NULL DEFAULT now(),
    rewarded_at      timestamptz,
    CHECK (referred_card_id <> referrer_card_id)
  )`,
  `CREATE INDEX IF NOT EXISTS loyalty_referrals_referrer_idx ON loyalty_referrals (referrer_card_id)`,
  // Kundenkonto ohne Termin (z.B. nur Stempelkarte): Angaben direkt beim Konto
  `ALTER TABLE customers ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT ''`,
  `ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT ''`,
  `ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_date text NOT NULL DEFAULT ''`,
];
