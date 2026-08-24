export type StatusLevel = 'confirmed' | 'partial' | 'missing' | 'not_checked' | 'needs_review' | 'manual';

export interface Work {
  id: string;
  cst_id: string | null;
  title: string;
  artist: string | null;
  featuring: string | null;
  work_type: string | null;
  work_date: string | null;
  isrc: string | null;
  iswc: string | null;
  upc: string | null;
  cover_url: string | null;
  bpm: number | null;
  duration: number | null;
  genre: string | null;
  subgenre: string | null;
  language: string | null;
  explicit: boolean | null;
  version: string | null;
  album: string | null;
  label: string | null;
  distributor: string | null;
  release_date: string | null;
  release_type: string | null;
  producer: string | null;
  copyright_p: string | null;
  copyright_c: string | null;
  status: string | null;
  composition_status: StatusLevel;
  publishing_status: StatusLevel;
  master_status: StatusLevel;
  release_status: StatusLevel;
  registration_status: StatusLevel;
  metadata_status: StatusLevel;
  created_at: string;
  updated_at: string;
}

export interface WorkContributor {
  id: string;
  work_id: string;
  name: string;
  artist_name: string | null;
  role: string;
  ipi: string | null;
  isni: string | null;
  pro: string | null;
  pro_id: string | null;
  publisher: string | null;
  administrator: string | null;
  split_percentage: number;
  created_at: string;
}

export type OrgStatus = 'confirmed' | 'manual' | 'not_found' | 'not_checked' | 'missing';

export interface WorkOrganization {
  id: string;
  work_id: string;
  organization: string;
  org_type: string | null;
  status: OrgStatus;
  identifier: string | null;
  registration_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkSource {
  id: string;
  work_id: string;
  field_name: string;
  source: string;
  source_value: string | null;
  retrieved_at: string;
  confidence: string | null;
  conflict: boolean;
  created_at: string;
}

export interface WorkWithRelations extends Work {
  contributors: WorkContributor[];
  organizations: WorkOrganization[];
  sources: WorkSource[];
}

export const COMPOSER_ROLES = [
  'Composer',
  'Lyricist',
  'Writer',
  'Co-Writer',
  'Topliner',
  'Producer',
  'Arranger',
  'Translator',
  'Adapter',
  'Sub-publisher',
] as const;

export const ORGANIZATIONS = [
  'ASCAP',
  'BMI',
  'SESAC',
  'PRS',
  'GEMA',
  'SACEM',
  'The MLC — Mechanical Licensing Collective',
  'SoundExchange',
  'Songtrust',
  'Kobalt',
  'CD Baby Pro',
  'DistroKid Publishing',
] as const;

export const ORG_TYPES: Record<string, string> = {
  ASCAP: 'PRO',
  BMI: 'PRO',
  SESAC: 'PRO',
  PRS: 'PRO',
  GEMA: 'PRO',
  SACEM: 'PRO',
  'The MLC — Mechanical Licensing Collective': 'mechanical',
  SoundExchange: 'neighboring',
  Songtrust: 'publisher',
  Kobalt: 'publisher',
  'CD Baby Pro': 'publisher',
  'DistroKid Publishing': 'publisher',
};
