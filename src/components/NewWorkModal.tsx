import { useState } from 'react';
import { Modal } from './Modal';
import { cn } from '@/lib/utils';
import { createWork } from '@/lib/api';
import type { Work } from '@/lib/types';
import {
  Music,
  Tag,
  Users,
  Disc3,
  Upload,
  Building2,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

interface NewWorkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (work: Work) => void;
}

type Step = 'basic' | 'identification' | 'composition' | 'master' | 'release' | 'organizations' | 'done';

const STEPS: { key: Step; label: string; icon: typeof Music }[] = [
  { key: 'basic', label: 'Basic Info', icon: Music },
  { key: 'identification', label: 'Identification', icon: Tag },
  { key: 'composition', label: 'Composition', icon: Users },
  { key: 'master', label: 'Master', icon: Disc3 },
  { key: 'release', label: 'Release', icon: Upload },
  { key: 'organizations', label: 'Organizations', icon: Building2 },
];

interface FormData {
  title: string;
  artist: string;
  featuring: string;
  work_type: string;
  work_date: string;
  isrc: string;
  iswc: string;
  upc: string;
  cover_url: string;
  bpm: string;
  duration: string;
  genre: string;
  subgenre: string;
  language: string;
  explicit: boolean;
  version: string;
  album: string;
  label: string;
  distributor: string;
  release_date: string;
  release_type: string;
  producer: string;
  copyright_p: string;
  copyright_c: string;
  contributors: { name: string; role: string; ipi: string; publisher: string; split: string }[];
  organizations: { name: string; status: string; identifier: string }[];
}

const EMPTY_FORM: FormData = {
  title: '',
  artist: '',
  featuring: '',
  work_type: 'original',
  work_date: '',
  isrc: '',
  iswc: '',
  upc: '',
  cover_url: '',
  bpm: '',
  duration: '',
  genre: '',
  subgenre: '',
  language: '',
  explicit: false,
  version: '',
  album: '',
  label: '',
  distributor: '',
  release_date: '',
  release_type: 'single',
  producer: '',
  copyright_p: '',
  copyright_c: '',
  contributors: [{ name: '', role: 'Composer', ipi: '', publisher: '', split: '100' }],
  organizations: [],
};

export function NewWorkModal({ open, onClose, onCreated }: NewWorkModalProps) {
  const [step, setStep] = useState<Step>('basic');
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{ field: string; value: string; source: string }[] | null>(null);

  const update = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnrich = async () => {
    if (!form.isrc) return;
    setEnriching(true);
    setError(null);

    setTimeout(() => {
      setEnrichResult([
        { field: 'cover_url', value: 'https://images.unsplash.com/photo-1493224535553-a3a3a3a3a3a3?w=400', source: 'Deezer (DEMO)' },
        { field: 'album', value: 'Auto-detected Album', source: 'Deezer (DEMO)' },
        { field: 'duration', value: '198', source: 'Deezer (DEMO)' },
        { field: 'genre', value: 'Pop', source: 'Deezer (DEMO)' },
      ]);
      setEnriching(false);
    }, 1500);
  };

  const applyEnrichment = () => {
    if (!enrichResult) return;
    const updates: Partial<FormData> = {};
    enrichResult.forEach((r) => {
      (updates as Record<string, string>)[r.field] = r.value;
    });
    setForm((prev) => ({ ...prev, ...updates }));
    setEnrichResult(null);
  };

  const addContributor = () => {
    setForm((prev) => ({
      ...prev,
      contributors: [...prev.contributors, { name: '', role: 'Composer', ipi: '', publisher: '', split: '0' }],
    }));
  };

  const updateContributor = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const removeContributor = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index),
    }));
  };

  const addOrg = () => {
    setForm((prev) => ({
      ...prev,
      organizations: [...prev.organizations, { name: 'ASCAP', status: 'not_checked', identifier: '' }],
    }));
  };

  const updateOrg = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      organizations: prev.organizations.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    }));
  };

  const removeOrg = (index: number) => {
    setForm((prev) => ({
      ...prev,
      organizations: prev.organizations.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const workData: Partial<Work> = {
        title: form.title,
        artist: form.artist || null,
        featuring: form.featuring || null,
        work_type: form.work_type,
        work_date: form.work_date || null,
        isrc: form.isrc || null,
        iswc: form.iswc || null,
        upc: form.upc || null,
        cover_url: form.cover_url || null,
        bpm: form.bpm ? parseInt(form.bpm) : null,
        duration: form.duration ? parseInt(form.duration) : null,
        genre: form.genre || null,
        subgenre: form.subgenre || null,
        language: form.language || null,
        explicit: form.explicit,
        version: form.version || null,
        album: form.album || null,
        label: form.label || null,
        distributor: form.distributor || null,
        release_date: form.release_date || null,
        release_type: form.release_type || null,
        producer: form.producer || null,
        copyright_p: form.copyright_p || null,
        copyright_c: form.copyright_c || null,
      };

      const contributors = form.contributors
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name,
          role: c.role,
          ipi: c.ipi || null,
          publisher: c.publisher || null,
          split_percentage: parseFloat(c.split) || 0,
        }));

      const work = await createWork(workData, contributors);
      setStep('done');
      setTimeout(() => {
        onCreated(work);
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work');
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep('basic');
    setForm(EMPTY_FORM);
    setError(null);
    setEnrichResult(null);
    setSaving(false);
    setEnriching(false);
    onClose();
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const canProceed = step === 'basic' ? form.title.trim().length > 0 : true;

  return (
    <Modal open={open} onClose={handleClose} size="xl">
      {/* Header */}
      <div className="border-b border-ink-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-ink-900">New work</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          {step === 'done'
            ? 'Work created successfully'
            : 'Add a work manually. You only need a title to get started — CST will help with the rest.'}
        </p>
      </div>

      {step === 'done' ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
            <Check className="h-7 w-7 text-success-600" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">Work created</h3>
          <p className="mt-1 text-sm text-ink-500">Opening work overview...</p>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-1 border-b border-ink-100 px-6 py-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.key;
              const isPast = currentStepIndex > i;
              return (
                <div key={s.key} className="flex items-center">
                  <button
                    onClick={() => setStep(s.key)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : isPast
                          ? 'text-ink-700 hover:bg-ink-50'
                          : 'text-ink-400 hover:bg-ink-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                        isActive
                          ? 'bg-brand-600 text-white'
                          : isPast
                            ? 'bg-success-500 text-white'
                            : 'bg-ink-200 text-ink-500',
                      )}
                    >
                      {isPast ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    {s.label}
                  </button>
                  {i < STEPS.length - 1 && <div className="mx-1 h-px w-4 bg-ink-200" />}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {step === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Title *</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="Enter the work title"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Artist</label>
                  <input
                    className="input"
                    value={form.artist}
                    onChange={(e) => update('artist', e.target.value)}
                    placeholder="Primary artist"
                  />
                </div>
                <div>
                  <label className="label">Featuring</label>
                  <input
                    className="input"
                    value={form.featuring}
                    onChange={(e) => update('featuring', e.target.value)}
                    placeholder="Featured artists"
                  />
                </div>
                <div>
                  <label className="label">Work type</label>
                  <select
                    className="input"
                    value={form.work_type}
                    onChange={(e) => update('work_type', e.target.value)}
                  >
                    <option value="original">Original</option>
                    <option value="cover">Cover</option>
                    <option value="remix">Remix</option>
                    <option value="co-write">Co-write</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={form.work_date}
                    onChange={(e) => update('work_date', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 'identification' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">ISRC</label>
                    <input
                      className="input font-mono"
                      value={form.isrc}
                      onChange={(e) => update('isrc', e.target.value.toUpperCase())}
                      placeholder="e.g. USRC12400001"
                    />
                    <p className="mt-1 text-xs text-ink-400">
                      International Standard Recording Code — identifies a recording.
                    </p>
                  </div>
                  <div>
                    <label className="label">ISWC</label>
                    <input
                      className="input font-mono"
                      value={form.iswc}
                      onChange={(e) => update('iswc', e.target.value.toUpperCase())}
                      placeholder="e.g. T-045.234.891-2"
                    />
                    <p className="mt-1 text-xs text-ink-400">
                      International Standard Musical Work Code — identifies a composition.
                    </p>
                  </div>
                  <div>
                    <label className="label">UPC / EAN</label>
                    <input
                      className="input font-mono"
                      value={form.upc}
                      onChange={(e) => update('upc', e.target.value)}
                      placeholder="Barcode for the release"
                    />
                  </div>
                </div>

                {form.isrc && (
                  <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-brand-600" />
                        <span className="text-sm font-medium text-ink-700">
                          Auto-enrichment available
                        </span>
                      </div>
                      <button
                        onClick={handleEnrich}
                        disabled={enriching}
                        className="btn-secondary text-xs"
                      >
                        {enriching ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Look up ISRC
                          </>
                        )}
                      </button>
                    </div>
                    {enrichResult && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-ink-600">
                          Found information (DEMO data):
                        </p>
                        {enrichResult.map((r, i) => (
                          <div key={i} className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 text-xs">
                            <span className="text-ink-500">{r.field}</span>
                            <span className="font-medium text-ink-700">{r.value}</span>
                            <span className="text-ink-400">via {r.source}</span>
                          </div>
                        ))}
                        <button onClick={applyEnrichment} className="btn-primary text-xs">
                          <Check className="h-3.5 w-3.5" />
                          Apply to work
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 'composition' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-500">Add composers, writers, and their split percentages.</p>
                  <button onClick={addContributor} className="btn-ghost text-xs">
                    + Add contributor
                  </button>
                </div>
                {form.contributors.map((c, i) => (
                  <div key={i} className="rounded-lg border border-ink-200 p-3">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-4">
                        <label className="label">Name</label>
                        <input
                          className="input"
                          value={c.name}
                          onChange={(e) => updateContributor(i, 'name', e.target.value)}
                          placeholder="Legal name"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="label">Role</label>
                        <select
                          className="input"
                          value={c.role}
                          onChange={(e) => updateContributor(i, 'role', e.target.value)}
                        >
                          <option value="Composer">Composer</option>
                          <option value="Lyricist">Lyricist</option>
                          <option value="Writer">Writer</option>
                          <option value="Co-Writer">Co-Writer</option>
                          <option value="Topliner">Topliner</option>
                          <option value="Arranger">Arranger</option>
                          <option value="Producer">Producer</option>
                        </select>
                      </div>
                      <div className="col-span-3">
                        <label className="label">IPI</label>
                        <input
                          className="input font-mono"
                          value={c.ipi}
                          onChange={(e) => updateContributor(i, 'ipi', e.target.value)}
                          placeholder="IPI / Writer ID"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="label">Split %</label>
                        <input
                          type="number"
                          className="input"
                          value={c.split}
                          onChange={(e) => updateContributor(i, 'split', e.target.value)}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Publisher</label>
                        <input
                          className="input"
                          value={c.publisher}
                          onChange={(e) => updateContributor(i, 'publisher', e.target.value)}
                          placeholder="Publishing company"
                        />
                      </div>
                      {form.contributors.length > 1 && (
                        <div className="flex items-end justify-end">
                          <button
                            onClick={() => removeContributor(i)}
                            className="btn-ghost text-xs text-danger-600 hover:bg-danger-50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <SplitSummary contributors={form.contributors} />
              </div>
            )}

            {step === 'master' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Producer</label>
                  <input
                    className="input"
                    value={form.producer}
                    onChange={(e) => update('producer', e.target.value)}
                    placeholder="Producer name"
                  />
                </div>
                <div>
                  <label className="label">BPM</label>
                  <input
                    type="number"
                    className="input"
                    value={form.bpm}
                    onChange={(e) => update('bpm', e.target.value)}
                    placeholder="Beats per minute"
                  />
                </div>
                <div>
                  <label className="label">Duration (seconds)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.duration}
                    onChange={(e) => update('duration', e.target.value)}
                    placeholder="e.g. 213"
                  />
                </div>
                <div>
                  <label className="label">Version</label>
                  <input
                    className="input"
                    value={form.version}
                    onChange={(e) => update('version', e.target.value)}
                    placeholder="e.g. Radio Edit"
                  />
                </div>
                <div>
                  <label className="label">Explicit</label>
                  <select
                    className="input"
                    value={form.explicit ? 'yes' : 'no'}
                    onChange={(e) => update('explicit', e.target.value === 'yes')}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Master file</label>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-ink-200 px-6 py-8 text-center">
                    <div>
                      <Upload className="mx-auto mb-2 h-6 w-6 text-ink-300" />
                      <p className="text-sm text-ink-400">Upload MP3 master file</p>
                      <p className="mt-1 text-xs text-ink-300">Architecture ready for storage — not yet connected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'release' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Album / EP / Single title</label>
                  <input
                    className="input"
                    value={form.album}
                    onChange={(e) => update('album', e.target.value)}
                    placeholder="Release title"
                  />
                </div>
                <div>
                  <label className="label">Release type</label>
                  <select
                    className="input"
                    value={form.release_type}
                    onChange={(e) => update('release_type', e.target.value)}
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                  </select>
                </div>
                <div>
                  <label className="label">Label</label>
                  <input
                    className="input"
                    value={form.label}
                    onChange={(e) => update('label', e.target.value)}
                    placeholder="Record label"
                  />
                </div>
                <div>
                  <label className="label">Distributor</label>
                  <input
                    className="input"
                    value={form.distributor}
                    onChange={(e) => update('distributor', e.target.value)}
                    placeholder="Distribution company"
                  />
                </div>
                <div>
                  <label className="label">Release date</label>
                  <input
                    type="date"
                    className="input"
                    value={form.release_date}
                    onChange={(e) => update('release_date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Genre</label>
                  <input
                    className="input"
                    value={form.genre}
                    onChange={(e) => update('genre', e.target.value)}
                    placeholder="Primary genre"
                  />
                </div>
                <div>
                  <label className="label">Subgenre</label>
                  <input
                    className="input"
                    value={form.subgenre}
                    onChange={(e) => update('subgenre', e.target.value)}
                    placeholder="Subgenre"
                  />
                </div>
                <div>
                  <label className="label">Language</label>
                  <input
                    className="input"
                    value={form.language}
                    onChange={(e) => update('language', e.target.value)}
                    placeholder="Language"
                  />
                </div>
                <div>
                  <label className="label">℗ Phonogram copyright</label>
                  <input
                    className="input"
                    value={form.copyright_p}
                    onChange={(e) => update('copyright_p', e.target.value)}
                    placeholder="e.g. 2024 Label Name"
                  />
                </div>
                <div>
                  <label className="label">© Copyright</label>
                  <input
                    className="input"
                    value={form.copyright_c}
                    onChange={(e) => update('copyright_c', e.target.value)}
                    placeholder="e.g. 2024 Artist Name"
                  />
                </div>
              </div>
            )}

            {step === 'organizations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-500">
                    Register the work with rights organizations. You can add these later.
                  </p>
                  <button onClick={addOrg} className="btn-ghost text-xs">
                    + Add organization
                  </button>
                </div>
                {form.organizations.length === 0 && (
                  <div className="rounded-lg border border-dashed border-ink-200 px-4 py-6 text-center">
                    <Building2 className="mx-auto mb-2 h-6 w-6 text-ink-300" />
                    <p className="text-sm text-ink-400">No organizations added yet</p>
                    <p className="mt-1 text-xs text-ink-300">
                      You can register with PROs, The MLC, SoundExchange and more later.
                    </p>
                  </div>
                )}
                {form.organizations.map((org, i) => (
                  <div key={i} className="flex items-end gap-2 rounded-lg border border-ink-200 p-3">
                    <div className="flex-1">
                      <label className="label">Organization</label>
                      <select
                        className="input"
                        value={org.name}
                        onChange={(e) => updateOrg(i, 'name', e.target.value)}
                      >
                        <option value="ASCAP">ASCAP</option>
                        <option value="BMI">BMI</option>
                        <option value="SESAC">SESAC</option>
                        <option value="PRS">PRS</option>
                        <option value="The MLC — Mechanical Licensing Collective">The MLC</option>
                        <option value="SoundExchange">SoundExchange</option>
                        <option value="Songtrust">Songtrust</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="label">Status</label>
                      <select
                        className="input"
                        value={org.status}
                        onChange={(e) => updateOrg(i, 'status', e.target.value)}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="manual">Manual</option>
                        <option value="not_checked">Not checked</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="label">Identifier</label>
                      <input
                        className="input font-mono"
                        value={org.identifier}
                        onChange={(e) => updateOrg(i, 'identifier', e.target.value)}
                        placeholder="Registration ID"
                      />
                    </div>
                    <button
                      onClick={() => removeOrg(i)}
                      className="btn-ghost text-xs text-danger-600 hover:bg-danger-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4">
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={() => setStep(STEPS[currentStepIndex - 1].key)}
                  className="btn-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="btn-ghost">
                Cancel
              </button>
              {currentStepIndex < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(STEPS[currentStepIndex + 1].key)}
                  disabled={!canProceed}
                  className="btn-primary"
                >
                  Continue
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving || !form.title.trim()} className="btn-primary">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create work
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function SplitSummary({ contributors }: { contributors: FormData['contributors'] }) {
  const total = contributors.reduce((sum, c) => sum + (parseFloat(c.split) || 0), 0);
  const isComplete = total === 100;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
        isComplete ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700',
      )}
    >
      {isComplete ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <span className="font-medium">Split total: {total}%</span>
      {!isComplete && <span className="text-xs">— Split is incomplete (should be 100%)</span>}
    </div>
  );
}
