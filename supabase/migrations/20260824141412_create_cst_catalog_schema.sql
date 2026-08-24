/*
# CST Catalog Schema — Music catalog management platform

This migration creates the core schema for CST, a catalog management platform for
artists, composers, producers, managers, labels and independents to organize their
musical works, rights, metadata, registrations and potential royalty sources.

The schema separates the following conceptual entities:
- WORK: the composition/song (the underlying written work)
- RECORDING: the master/recording of a work
- RELEASE: the distribution/release of a recording
- CONTRIBUTORS: people involved (composers, writers, producers, performers)
- WORK_CONTRIBUTORS: junction linking contributors to works with roles and splits
- WORK_ORGANIZATIONS: registrations with rights organizations (PROs, MLC, etc.)
- WORK_SOURCES: provenance of data — where each piece of information came from

This is a single-tenant app with no authentication. All policies use TO anon, authenticated
so the anon-key frontend can read and write its own data.

## 1. New Tables

### works
The central entity — a musical composition/song.
- id (uuid, PK)
- cst_id (text, unique) — human-readable CST identifier (e.g. CST-000001)
- title (text, not null) — work title
- artist (text) — primary artist/performer
- featuring (text) — featured artists
- work_type (text) — e.g. 'original', 'cover', 'remix', 'co-write'
- work_date (date) — date of the work
- isrc (text, unique) — International Standard Recording Code
- iswc (text) — International Standard Musical Work Code
- upc (text) — Universal Product Code (barcode for release)
- cover_url (text) — artwork/cover image URL
- bpm (integer) — beats per minute
- duration (integer) — duration in seconds
- genre (text) — primary genre
- subgenre (text) — subgenre
- language (text) — language of lyrics
- explicit (boolean, default false) — explicit content flag
- version (text) — version descriptor (e.g. 'Radio Edit', 'Extended Mix')
- album (text) — album/EP/single title
- label (text) — record label
- distributor (text) — distribution company
- release_date (date) — release date
- release_type (text) — 'single', 'ep', 'album'
- producer (text) — producer name
- copyright_p (text) — phonogram copyright (℗)
- copyright_c (text) — copyright (©)
- status (text, default 'draft') — overall status
- composition_status (text, default 'missing') — composition identification status
- publishing_status (text, default 'missing') — publishing info status
- master_status (text, default 'missing') — master/recording status
- release_status (text, default 'missing') — release status
- registration_status (text, default 'missing') — registration with orgs status
- metadata_status (text, default 'missing') — metadata completeness status
- created_at (timestamptz)
- updated_at (timestamptz)

### work_contributors
People involved in a work, with their role and split percentage.
- id (uuid, PK)
- work_id (uuid, FK → works.id, ON DELETE CASCADE)
- name (text, not null) — contributor name (legal name)
- artist_name (text) — stage/artist name if different
- role (text, not null) — role in the work (e.g. 'Composer', 'Lyricist', 'Producer')
- ipi (text) — Interested Party Information identifier
- isni (text) — International Standard Name Identifier
- pro (text) — PRO affiliation (e.g. 'ASCAP', 'BMI')
- pro_id (text) — PRO member ID
- publisher (text) — publisher name
- administrator (text) — publishing administrator
- split_percentage (numeric, default 0) — composition split percentage
- created_at (timestamptz)

### work_organizations
Registrations with rights organizations.
- id (uuid, PK)
- work_id (uuid, FK → works.id, ON DELETE CASCADE)
- organization (text, not null) — e.g. 'ASCAP', 'BMI', 'The MLC', 'SoundExchange'
- org_type (text) — 'PRO', 'mechanical', 'neighboring', 'publisher'
- status (text, default 'not_checked') — 'confirmed', 'manual', 'not_found', 'not_checked', 'missing'
- identifier (text) — registration ID with the org
- registration_date (date) — date registered
- notes (text) — additional info
- created_at (timestamptz)

### work_sources
Provenance tracking — where each piece of data came from.
- id (uuid, PK)
- work_id (uuid, FK → works.id, ON DELETE CASCADE)
- field_name (text, not null) — which field this provenance applies to (e.g. 'artist', 'isrc')
- source (text, not null) — 'manual', 'csv', 'deezer', 'the_mlc', etc.
- source_value (text) — the value as returned by the source
- retrieved_at (timestamptz) — when the data was retrieved
- confidence (text) — 'high', 'medium', 'low'
- conflict (boolean, default false) — whether this conflicts with existing data
- created_at (timestamptz)

## 2. Indexes
- works.isrc (unique)
- works.cst_id (unique)
- work_contributors.work_id
- work_organizations.work_id
- work_sources.work_id

## 3. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant, no auth, intentionally shared data).
*/

-- Works table
CREATE TABLE IF NOT EXISTS works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cst_id text UNIQUE,
  title text NOT NULL,
  artist text,
  featuring text,
  work_type text DEFAULT 'original',
  work_date date,
  isrc text UNIQUE,
  iswc text,
  upc text,
  cover_url text,
  bpm integer,
  duration integer,
  genre text,
  subgenre text,
  language text,
  explicit boolean DEFAULT false,
  version text,
  album text,
  label text,
  distributor text,
  release_date date,
  release_type text,
  producer text,
  copyright_p text,
  copyright_c text,
  status text DEFAULT 'draft',
  composition_status text DEFAULT 'missing',
  publishing_status text DEFAULT 'missing',
  master_status text DEFAULT 'missing',
  release_status text DEFAULT 'missing',
  registration_status text DEFAULT 'missing',
  metadata_status text DEFAULT 'missing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_works" ON works;
CREATE POLICY "anon_select_works" ON works FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_works" ON works;
CREATE POLICY "anon_insert_works" ON works FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_works" ON works;
CREATE POLICY "anon_update_works" ON works FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_works" ON works;
CREATE POLICY "anon_delete_works" ON works FOR DELETE
  TO anon, authenticated USING (true);

-- Work contributors table
CREATE TABLE IF NOT EXISTS work_contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  name text NOT NULL,
  artist_name text,
  role text NOT NULL DEFAULT 'Composer',
  ipi text,
  isni text,
  pro text,
  pro_id text,
  publisher text,
  administrator text,
  split_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_contributors_work_id ON work_contributors(work_id);

ALTER TABLE work_contributors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_contributors" ON work_contributors;
CREATE POLICY "anon_select_work_contributors" ON work_contributors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_contributors" ON work_contributors;
CREATE POLICY "anon_insert_work_contributors" ON work_contributors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_work_contributors" ON work_contributors;
CREATE POLICY "anon_update_work_contributors" ON work_contributors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_contributors" ON work_contributors;
CREATE POLICY "anon_delete_work_contributors" ON work_contributors FOR DELETE
  TO anon, authenticated USING (true);

-- Work organizations table
CREATE TABLE IF NOT EXISTS work_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  organization text NOT NULL,
  org_type text,
  status text DEFAULT 'not_checked',
  identifier text,
  registration_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_organizations_work_id ON work_organizations(work_id);

ALTER TABLE work_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_organizations" ON work_organizations;
CREATE POLICY "anon_select_work_organizations" ON work_organizations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_organizations" ON work_organizations;
CREATE POLICY "anon_insert_work_organizations" ON work_organizations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_work_organizations" ON work_organizations;
CREATE POLICY "anon_update_work_organizations" ON work_organizations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_organizations" ON work_organizations;
CREATE POLICY "anon_delete_work_organizations" ON work_organizations FOR DELETE
  TO anon, authenticated USING (true);

-- Work sources (provenance) table
CREATE TABLE IF NOT EXISTS work_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  source_value text,
  retrieved_at timestamptz DEFAULT now(),
  confidence text DEFAULT 'high',
  conflict boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_sources_work_id ON work_sources(work_id);

ALTER TABLE work_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_work_sources" ON work_sources;
CREATE POLICY "anon_select_work_sources" ON work_sources FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_work_sources" ON work_sources;
CREATE POLICY "anon_insert_work_sources" ON work_sources FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_work_sources" ON work_sources;
CREATE POLICY "anon_update_work_sources" ON work_sources FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_work_sources" ON work_sources;
CREATE POLICY "anon_delete_work_sources" ON work_sources FOR DELETE
  TO anon, authenticated USING (true);

-- Updated_at trigger for works
CREATE OR REPLACE FUNCTION update_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_works_updated_at ON works;
CREATE TRIGGER trigger_works_updated_at
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_works_updated_at();
