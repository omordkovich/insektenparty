-- Migration: create_guests_table
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name varchar(100) NOT NULL,
  additional_guests integer DEFAULT 0 NOT NULL,
  arrival_time time NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS guests_arrival_time_name_idx ON guests (arrival_time, name);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE guests FROM anon, authenticated;
