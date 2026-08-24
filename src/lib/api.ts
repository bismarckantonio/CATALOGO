import { supabase } from './supabase';
import type { Work, WorkContributor, WorkOrganization, WorkSource, WorkWithRelations } from './types';
import { generateCstId } from './utils';

export async function fetchWorks(): Promise<Work[]> {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchWork(id: string): Promise<WorkWithRelations | null> {
  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!work) return null;

  const [contributorsRes, orgsRes, sourcesRes] = await Promise.all([
    supabase.from('work_contributors').select('*').eq('work_id', id).order('created_at'),
    supabase.from('work_organizations').select('*').eq('work_id', id).order('created_at'),
    supabase.from('work_sources').select('*').eq('work_id', id).order('created_at'),
  ]);

  if (contributorsRes.error) throw contributorsRes.error;
  if (orgsRes.error) throw orgsRes.error;
  if (sourcesRes.error) throw sourcesRes.error;

  return {
    ...work,
    contributors: contributorsRes.data || [],
    organizations: orgsRes.data || [],
    sources: sourcesRes.data || [],
  };
}

export async function createWork(
  workData: Partial<Work>,
  contributors?: Partial<WorkContributor>[],
): Promise<Work> {
  const { data: existing } = await supabase.from('works').select('cst_id');
  const existingIds = (existing || []).map((w) => w.cst_id || '');
  const cstId = generateCstId(existingIds);

  const insertData = {
    cst_id: cstId,
    title: workData.title || 'Untitled',
    artist: workData.artist || null,
    featuring: workData.featuring || null,
    work_type: workData.work_type || 'original',
    work_date: workData.work_date || null,
    isrc: workData.isrc || null,
    iswc: workData.iswc || null,
    upc: workData.upc || null,
    cover_url: workData.cover_url || null,
    bpm: workData.bpm || null,
    duration: workData.duration || null,
    genre: workData.genre || null,
    subgenre: workData.subgenre || null,
    language: workData.language || null,
    explicit: workData.explicit || false,
    version: workData.version || null,
    album: workData.album || null,
    label: workData.label || null,
    distributor: workData.distributor || null,
    release_date: workData.release_date || null,
    release_type: workData.release_type || null,
    producer: workData.producer || null,
    copyright_p: workData.copyright_p || null,
    copyright_c: workData.copyright_c || null,
    composition_status: 'partial',
    publishing_status: 'missing',
    master_status: workData.isrc ? 'partial' : 'missing',
    release_status: workData.release_date ? 'partial' : 'missing',
    registration_status: 'not_checked',
    metadata_status: 'partial',
  };

  const { data, error } = await supabase.from('works').insert(insertData).select().single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create work');

  if (contributors && contributors.length > 0) {
    const contributorInserts = contributors.map((c) => ({
      work_id: data.id,
      name: c.name || '',
      artist_name: c.artist_name || null,
      role: c.role || 'Composer',
      ipi: c.ipi || null,
      isni: c.isni || null,
      pro: c.pro || null,
      pro_id: c.pro_id || null,
      publisher: c.publisher || null,
      administrator: c.administrator || null,
      split_percentage: c.split_percentage || 0,
    }));

    const { error: contribError } = await supabase.from('work_contributors').insert(contributorInserts);
    if (contribError) throw contribError;
  }

  if (workData.isrc) {
    await supabase.from('work_sources').insert({
      work_id: data.id,
      field_name: 'isrc',
      source: 'manual',
      source_value: workData.isrc,
      confidence: 'high',
    });
  }

  return data;
}

export async function updateWork(id: string, updates: Partial<Work>): Promise<Work> {
  const { data, error } = await supabase
    .from('works')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWork(id: string): Promise<void> {
  const { error } = await supabase.from('works').delete().eq('id', id);
  if (error) throw error;
}

export async function addContributor(contributor: Partial<WorkContributor>): Promise<WorkContributor> {
  const { data, error } = await supabase
    .from('work_contributors')
    .insert(contributor)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContributor(id: string, updates: Partial<WorkContributor>): Promise<WorkContributor> {
  const { data, error } = await supabase
    .from('work_contributors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContributor(id: string): Promise<void> {
  const { error } = await supabase.from('work_contributors').delete().eq('id', id);
  if (error) throw error;
}

export async function addOrganization(org: Partial<WorkOrganization>): Promise<WorkOrganization> {
  const { data, error } = await supabase
    .from('work_organizations')
    .insert(org)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrganization(id: string, updates: Partial<WorkOrganization>): Promise<WorkOrganization> {
  const { data, error } = await supabase
    .from('work_organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrganization(id: string): Promise<void> {
  const { error } = await supabase.from('work_organizations').delete().eq('id', id);
  if (error) throw error;
}

export async function addSource(source: Partial<WorkSource>): Promise<void> {
  const { error } = await supabase.from('work_sources').insert(source);
  if (error) throw error;
}
