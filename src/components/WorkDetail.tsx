import { cn, computeCompleteness, getOpportunityAlerts, formatDuration, formatDate, getComposers, getSplitTotal, isSplitComplete, getSourceLabel, getOrgStatusInfo, getOrgStatusBadgeClasses } from '@/lib/utils';
import type { WorkWithRelations } from '@/lib/types';
import { Cover } from './Cover';
import { StatusBadge, StatusIndicator } from './StatusBadge';
import { Tooltip } from './Tooltip';
import {
  Music,
  FileText,
  Disc3,
  Upload,
  Building2,
  Users,
  Database,
  Tag,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Info,
  Check,
  Globe,
  Printer,
} from 'lucide-react';
import { useState } from 'react';
import { SplitSheet } from './SplitSheet';

type Tab = 'overview' | 'composition' | 'split' | 'metadata' | 'master' | 'release' | 'organizations';

interface WorkDetailProps {
  work: WorkWithRelations;
  onBack: () => void;
  onUpdate: () => void;
}

const TABS: { key: Tab; label: string; icon: typeof Music }[] = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'composition', label: 'Composition', icon: Music },
  { key: 'split', label: 'Split', icon: Users },
  { key: 'metadata', label: 'Metadata', icon: Database },
  { key: 'master', label: 'Master', icon: Disc3 },
  { key: 'release', label: 'Release', icon: Upload },
  { key: 'organizations', label: 'Organizations', icon: Building2 },
];

const STATUS_DIMENSIONS = [
  { key: 'composition_status' as const, label: 'Composition', icon: Music },
  { key: 'publishing_status' as const, label: 'Publishing', icon: FileText },
  { key: 'master_status' as const, label: 'Master', icon: Disc3 },
  { key: 'release_status' as const, label: 'Release', icon: Upload },
  { key: 'registration_status' as const, label: 'Registration', icon: Building2 },
  { key: 'metadata_status' as const, label: 'Metadata', icon: Database },
];

export function WorkDetail({ work, onBack, onUpdate }: WorkDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showSplitSheet, setShowSplitSheet] = useState(false);

  const completeness = computeCompleteness(work);
  const alerts = getOpportunityAlerts(work);
  const conflicts = work.sources.filter((s) => s.conflict);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-ink-100 bg-white px-6 py-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <Cover url={work.cover_url} title={work.title} size="lg" />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-400">{work.cst_id}</span>
              <StatusBadge status={work.composition_status} />
              {conflicts.length > 0 && (
                <span className="badge bg-warning-50 text-warning-700 border border-warning-200">
                  <AlertCircle className="h-3 w-3" />
                  {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="mt-1 text-xl font-bold text-ink-900">{work.title}</h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {work.artist}
              {work.featuring && ` ft. ${work.featuring}`}
            </p>

            {/* Status indicators */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {STATUS_DIMENSIONS.map(({ key, label, icon: Icon }) => (
                <StatusIndicator key={key} label={label} status={work[key]} icon={Icon} />
              ))}
            </div>
          </div>

          {/* Completeness */}
          <div className="flex flex-col items-end">
            <div className="text-right">
              <div className="text-xs font-medium text-ink-400">Catalog completeness</div>
              <div className={cn(
                'mt-0.5 text-2xl font-bold',
                completeness >= 80 ? 'text-success-600' : completeness >= 40 ? 'text-warning-600' : 'text-ink-400',
              )}>
                {completeness}%
              </div>
            </div>
            <button className="btn-ghost mt-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              Update data
            </button>
          </div>
        </div>

        {/* Opportunity alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-3 py-2',
                  alert.severity === 'warning'
                    ? 'border-warning-200 bg-warning-50'
                    : 'border-brand-100 bg-brand-50/50',
                )}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className={cn('h-4 w-4', alert.severity === 'warning' ? 'text-warning-600' : 'text-brand-600')} />
                  <span className="text-sm text-ink-700">{alert.message}</span>
                </div>
                <button className="btn-ghost text-xs">{alert.action}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-100 bg-white px-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-700',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-ink-50/30 p-6">
        {activeTab === 'overview' && <OverviewTab work={work} />}
        {activeTab === 'composition' && <CompositionTab work={work} />}
        {activeTab === 'split' && (
          <SplitTab work={work} onGenerateSheet={() => setShowSplitSheet(true)} />
        )}
        {activeTab === 'metadata' && <MetadataTab work={work} />}
        {activeTab === 'master' && <MasterTab work={work} />}
        {activeTab === 'release' && <ReleaseTab work={work} />}
        {activeTab === 'organizations' && <OrganizationsTab work={work} />}
      </div>

      {/* Split Sheet Modal */}
      {showSplitSheet && (
        <SplitSheet work={work} onClose={() => setShowSplitSheet(false)} />
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children, action }: { title: string; icon: typeof Music; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-ink-400" />
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, source }: { label: string; value: React.ReactNode; mono?: boolean; source?: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm text-ink-800', mono && 'font-mono')}>{value || <span className="text-ink-300">—</span>}</span>
        {source && (
          <Tooltip content={`Source: ${source}`}>
            <Info className="h-3 w-3 text-ink-300" />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function getSourceForField(work: WorkWithRelations, fieldName: string): string | undefined {
  const source = work.sources.find((s) => s.field_name === fieldName && !s.conflict);
  return source ? getSourceLabel(source.source) : undefined;
}

function OverviewTab({ work }: { work: WorkWithRelations }) {
  const composers = getComposers(work.contributors);
  const conflicts = work.sources.filter((s) => s.conflict);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Identification */}
      <Section title="Identification" icon={Tag}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CST ID" value={work.cst_id} mono source="CST" />
          <Field label="ISRC" value={work.isrc} mono source={getSourceForField(work, 'isrc')} />
          <Field label="ISWC" value={work.iswc} mono source={getSourceForField(work, 'iswc')} />
          <Field label="UPC / EAN" value={work.upc} mono />
        </div>
      </Section>

      {/* Composition summary */}
      <Section title="Composition" icon={Music}>
        <div className="space-y-3">
          {composers.length > 0 ? (
            composers.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink-800">{c.name}</div>
                  <div className="text-xs text-ink-400">{c.role} · {c.split_percentage}%</div>
                </div>
                {c.publisher && <div className="text-xs text-ink-500">{c.publisher}</div>}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-400">No composers added yet.</p>
          )}
        </div>
      </Section>

      {/* Master summary */}
      <Section title="Master / Recording" icon={Disc3}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Producer" value={work.producer} />
          <Field label="BPM" value={work.bpm} />
          <Field label="Duration" value={work.duration ? formatDuration(work.duration) : null} />
          <Field label="Version" value={work.version} />
          <Field label="Explicit" value={work.explicit ? 'Yes' : 'No'} />
          <Field label="Genre" value={work.genre} source={getSourceForField(work, 'genre')} />
        </div>
      </Section>

      {/* Release summary */}
      <Section title="Release" icon={Upload}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Album" value={work.album} source={getSourceForField(work, 'album')} />
          <Field label="Release type" value={work.release_type} />
          <Field label="Label" value={work.label} />
          <Field label="Distributor" value={work.distributor} />
          <Field label="Release date" value={formatDate(work.release_date)} source={getSourceForField(work, 'release_date')} />
          <Field label="UPC" value={work.upc} mono />
        </div>
      </Section>

      {/* Organizations summary */}
      <Section title="Organizations" icon={Building2}>
        <div className="space-y-2">
          {work.organizations.length > 0 ? (
            work.organizations.map((org) => {
              const statusInfo = getOrgStatusInfo(org.status);
              return (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="text-sm text-ink-700">{org.organization}</div>
                  <span className={cn('badge', statusInfo.classes)}>
                    {statusInfo.label}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-ink-400">No organizations registered yet.</p>
          )}
        </div>
      </Section>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Section title="Data conflicts" icon={AlertCircle}>
          <div className="space-y-3">
            {conflicts.map((conflict) => {
              const manualSource = work.sources.find((s) => s.field_name === conflict.field_name && s.source === 'manual');
              return (
                <div key={conflict.id} className="rounded-lg border border-warning-200 bg-warning-50/50 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning-600" />
                    <span className="text-sm font-medium text-ink-700">
                      Different information found for: <span className="capitalize">{conflict.field_name}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-white p-2">
                      <div className="text-xs font-medium text-ink-400">CST</div>
                      <div className="text-sm text-ink-800">{manualSource?.source_value || (work as unknown as Record<string, unknown>)[conflict.field_name] as string || '—'}</div>
                    </div>
                    <div className="rounded-md bg-white p-2">
                      <div className="text-xs font-medium text-ink-400">{getSourceLabel(conflict.source)}</div>
                      <div className="text-sm text-ink-800">{conflict.source_value}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn-secondary text-xs">Keep CST</button>
                    <button className="btn-secondary text-xs">Use external</button>
                    <button className="btn-ghost text-xs">Edit manually</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function CompositionTab({ work }: { work: WorkWithRelations }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Section title="Work details" icon={Music}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" value={work.title} />
          <Field label="Work type" value={work.work_type} />
          <Field label="Date" value={formatDate(work.work_date)} />
          <Field label="ISWC" value={work.iswc} mono />
        </div>
      </Section>

      <Section title="Composers & Writers" icon={Users}>
        <div className="space-y-3">
          {work.contributors.map((c) => (
            <div key={c.id} className="rounded-lg border border-ink-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink-900">{c.name}</div>
                  {c.artist_name && c.artist_name !== c.name && (
                    <div className="text-xs text-ink-400">aka {c.artist_name}</div>
                  )}
                </div>
                <span className="badge bg-ink-100 text-ink-600">{c.role}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-ink-400">IPI: </span>
                  <span className="font-mono text-ink-600">{c.ipi || '—'}</span>
                </div>
                <div>
                  <span className="text-ink-400">PRO: </span>
                  <span className="text-ink-600">{c.pro || '—'}</span>
                </div>
                <div>
                  <span className="text-ink-400">Split: </span>
                  <span className="font-medium text-ink-700">{c.split_percentage}%</span>
                </div>
              </div>
              {(c.publisher || c.administrator) && (
                <div className="mt-1.5 text-xs">
                  {c.publisher && <span className="text-ink-400">Publisher: <span className="text-ink-600">{c.publisher}</span></span>}
                  {c.administrator && <span className="ml-3 text-ink-400">Admin: <span className="text-ink-600">{c.administrator}</span></span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SplitTab({ work, onGenerateSheet }: { work: WorkWithRelations; onGenerateSheet: () => void }) {
  const composers = getComposers(work.contributors);
  const total = getSplitTotal(work.contributors);
  const isComplete = isSplitComplete(work.contributors);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Section
        title="Split"
        icon={Users}
        action={
          <button onClick={onGenerateSheet} className="btn-secondary text-xs">
            <Printer className="h-3.5 w-3.5" />
            Generate Split Sheet
          </button>
        }
      >
        <div className="space-y-3">
          {composers.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-900">{c.name}</div>
                <div className="text-xs text-ink-400">{c.role}</div>
              </div>
              <div className="w-32">
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={cn('h-full rounded-full', isComplete ? 'bg-success-500' : 'bg-warning-500')}
                    style={{ width: `${c.split_percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-semibold text-ink-700">
                {c.split_percentage}%
              </div>
            </div>
          ))}

          {composers.length === 0 && (
            <p className="text-sm text-ink-400">No composers with split percentages yet.</p>
          )}

          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
            isComplete ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700',
          )}>
            {isComplete ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="font-medium">Total: {total}%</span>
            {!isComplete && <span className="text-xs">— Split incomplete (must be 100%)</span>}
          </div>
        </div>
      </Section>

      <Section title="Publisher information" icon={FileText}>
        <div className="space-y-3">
          {composers.filter((c) => c.publisher).map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-ink-800">{c.publisher}</div>
                <div className="text-xs text-ink-400">for {c.name}</div>
              </div>
              {c.administrator && <div className="text-xs text-ink-500">Admin: {c.administrator}</div>}
            </div>
          ))}
          {composers.filter((c) => c.publisher).length === 0 && (
            <p className="text-sm text-ink-400">No publisher information available.</p>
          )}
        </div>
      </Section>
    </div>
  );
}

function MetadataTab({ work }: { work: WorkWithRelations }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Section title="Recording metadata" icon={Database}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" value={work.title} />
          <Field label="Version" value={work.version} />
          <Field label="Artist" value={work.artist} />
          <Field label="Featuring" value={work.featuring} />
          <Field label="Album" value={work.album} source={getSourceForField(work, 'album')} />
          <Field label="Genre" value={work.genre} source={getSourceForField(work, 'genre')} />
          <Field label="Subgenre" value={work.subgenre} />
          <Field label="ISRC" value={work.isrc} mono />
          <Field label="UPC / EAN" value={work.upc} mono />
          <Field label="Release date" value={formatDate(work.release_date)} source={getSourceForField(work, 'release_date')} />
          <Field label="Duration" value={work.duration ? formatDuration(work.duration) : null} />
          <Field label="BPM" value={work.bpm} source={getSourceForField(work, 'bpm')} />
          <Field label="Language" value={work.language} />
          <Field label="Explicit" value={work.explicit ? 'Yes' : 'No'} />
        </div>
      </Section>

      <Section title="Copyright & Credits" icon={FileText}>
        <div className="grid grid-cols-1 gap-4">
          <Field label="℗ Phonogram copyright" value={work.copyright_p} />
          <Field label="© Copyright" value={work.copyright_c} />
          <Field label="Label" value={work.label} />
          <Field label="Distributor" value={work.distributor} />
          <Field label="Producer" value={work.producer} />
        </div>

        <div className="mt-4 border-t border-ink-100 pt-4">
          <div className="label">Contributors</div>
          <div className="mt-2 space-y-1.5">
            {work.contributors.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{c.name}</span>
                <span className="text-xs text-ink-400">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function MasterTab({ work }: { work: WorkWithRelations }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Section title="Recording information" icon={Disc3}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ISRC" value={work.isrc} mono />
          <Field label="Producer" value={work.producer} />
          <Field label="BPM" value={work.bpm} />
          <Field label="Duration" value={work.duration ? formatDuration(work.duration) : null} />
          <Field label="Version" value={work.version} />
          <Field label="Explicit" value={work.explicit ? 'Yes' : 'No'} />
        </div>
      </Section>

      <Section title="Master file" icon={Disc3}>
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-ink-200 px-6 py-10 text-center">
          <div>
            <Disc3 className="mx-auto mb-3 h-8 w-8 text-ink-300" />
            <p className="text-sm text-ink-400">No master file uploaded</p>
            <p className="mt-1 text-xs text-ink-300">
              Storage architecture is prepared — upload not yet connected
            </p>
            <button className="btn-secondary mt-3 text-xs" disabled>
              <Upload className="h-3.5 w-3.5" />
              Upload MP3
            </button>
          </div>
        </div>
      </Section>

      <Section title="Associated release" icon={Upload}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Album" value={work.album} source={getSourceForField(work, 'album')} />
          <Field label="Release type" value={work.release_type} />
          <Field label="Label" value={work.label} />
          <Field label="Release date" value={formatDate(work.release_date)} source={getSourceForField(work, 'release_date')} />
        </div>
      </Section>
    </div>
  );
}

function ReleaseTab({ work }: { work: WorkWithRelations }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Section title="Release details" icon={Upload}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title" value={work.album} source={getSourceForField(work, 'album')} />
          <Field label="Type" value={work.release_type} />
          <Field label="Release date" value={formatDate(work.release_date)} source={getSourceForField(work, 'release_date')} />
          <Field label="UPC / EAN" value={work.upc} mono />
        </div>
      </Section>

      <Section title="Distribution" icon={Building2}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Label" value={work.label} />
          <Field label="Distributor" value={work.distributor} />
          <Field label="℗ Phonogram" value={work.copyright_p} />
          <Field label="© Copyright" value={work.copyright_c} />
        </div>
      </Section>

      <Section title="Platforms" icon={Globe}>
        <div className="flex flex-wrap gap-2">
          {['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Deezer', 'Tidal'].map((p) => (
            <span key={p} className="badge bg-ink-100 text-ink-600 border border-ink-200">
              {p}
            </span>
          ))}
          <span className="text-xs text-ink-400 self-center">— Platform list is illustrative (DEMO)</span>
        </div>
      </Section>
    </div>
  );
}

function OrganizationsTab({ work }: { work: WorkWithRelations }) {
  const [orgs, setOrgs] = useState(work.organizations);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Section title="Rights organizations" icon={Building2}>
        <div className="space-y-2">
          {orgs.map((org) => {
            const statusInfo = getOrgStatusInfo(org.status);
            return (
              <div key={org.id} className="flex items-center justify-between rounded-lg border border-ink-100 p-3">
                <div>
                  <div className="text-sm font-medium text-ink-800">{org.organization}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
                    {org.org_type && <span className="capitalize">{org.org_type}</span>}
                    {org.identifier && <span>· ID: <span className="font-mono">{org.identifier}</span></span>}
                    {org.registration_date && <span>· {formatDate(org.registration_date)}</span>}
                  </div>
                </div>
                <span className={cn('badge', statusInfo.classes)}>
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
          {orgs.length === 0 && (
            <p className="text-sm text-ink-400">No organizations registered yet.</p>
          )}
        </div>
      </Section>

      <Section title="Status legend" icon={Info}>
        <div className="space-y-2">
          {[
            { label: 'Confirmed', desc: 'Verified through an external source', color: 'success' },
            { label: 'Manual', desc: 'Entered manually by the user', color: 'brand' },
            { label: 'Not found', desc: 'Checked but no registration found', color: 'danger' },
            { label: 'Not checked', desc: 'Has not been checked yet', color: 'ink' },
            { label: 'Missing', desc: 'Expected but not present', color: 'warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={cn('badge', getOrgStatusBadgeClasses(s.color))}>
                {s.label}
              </span>
              <span className="text-xs text-ink-500">{s.desc}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
