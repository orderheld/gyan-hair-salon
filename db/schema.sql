-- GYAN Hair Salon: Datenbankschema (PostgreSQL / Neon)
-- Wird von "npm run db:setup" ausgeführt. Kann mehrfach laufen.

CREATE TABLE IF NOT EXISTS services (
  id           serial PRIMARY KEY,
  slug_de      text NOT NULL UNIQUE,
  slug_fr      text NOT NULL UNIQUE,
  slug_en      text NOT NULL UNIQUE,
  name_de      text NOT NULL,
  name_fr      text NOT NULL DEFAULT '',
  name_en      text NOT NULL DEFAULT '',
  short_de     text NOT NULL DEFAULT '',
  short_fr     text NOT NULL DEFAULT '',
  short_en     text NOT NULL DEFAULT '',
  long_de      text NOT NULL DEFAULT '',
  long_fr      text NOT NULL DEFAULT '',
  long_en      text NOT NULL DEFAULT '',
  image        text NOT NULL DEFAULT '',
  duration_min integer NOT NULL CHECK (duration_min BETWEEN 5 AND 480),
  price_chf    numeric(8,2) NOT NULL CHECK (price_chf >= 0),
  price_from   boolean NOT NULL DEFAULT false,
  active       boolean NOT NULL DEFAULT true,
  sort         integer NOT NULL DEFAULT 0
);

-- weekday: 0 = Sonntag, 1 = Montag ... 6 = Samstag
CREATE TABLE IF NOT EXISTS opening_hours (
  weekday     integer PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  is_open     boolean NOT NULL DEFAULT true,
  open_time   time NOT NULL DEFAULT '09:00',
  close_time  time NOT NULL DEFAULT '19:00',
  break_start time,
  break_end   time,
  CHECK (close_time > open_time)
);

CREATE TABLE IF NOT EXISTS blocked_times (
  id         serial PRIMARY KEY,
  starts_at  timestamptz NOT NULL,
  ends_at    timestamptz NOT NULL,
  reason     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

-- Einstellungen aus dem Admin-Panel (Buchungsregeln, E-Mails)
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       integer REFERENCES services(id) ON DELETE SET NULL,
  service_name     text NOT NULL,
  price_chf        numeric(8,2),
  duration_min     integer NOT NULL,
  starts_at        timestamptz NOT NULL,
  ends_at          timestamptz NOT NULL,
  -- Ende inklusive Pufferzeit: bis hier ist Zana belegt
  busy_until       timestamptz NOT NULL,
  customer_name    text NOT NULL,
  customer_email   text NOT NULL DEFAULT '',
  customer_phone   text NOT NULL DEFAULT '',
  note             text NOT NULL DEFAULT '',
  locale           text NOT NULL DEFAULT 'de' CHECK (locale IN ('de', 'fr', 'en')),
  status           text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  source           text NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'admin')),
  cancel_token     text NOT NULL UNIQUE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  cancelled_at     timestamptz,
  reminder_sent_at timestamptz,
  followup_sent_at timestamptz,
  CHECK (ends_at > starts_at),
  CHECK (busy_until >= ends_at),
  -- Schutz vor Doppelbuchungen direkt in der Datenbank:
  -- zwei bestätigte Termine (inkl. Puffer) dürfen sich nie überschneiden.
  CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
    tstzrange(starts_at, busy_until, '[)') WITH &&
  ) WHERE (status = 'confirmed')
);

CREATE INDEX IF NOT EXISTS bookings_starts_at_idx ON bookings (starts_at);
CREATE INDEX IF NOT EXISTS blocked_times_range_idx ON blocked_times (starts_at, ends_at);
