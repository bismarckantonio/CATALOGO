import { useState, useMemo } from 'react';
import type { Work } from '@/lib/types';
import { cn, computeCompleteness } from '@/lib/utils';
import { Cover } from './Cover';
import { StatusBadge, StatusIndicator } from './StatusBadge';
import { Tooltip } from './Tooltip';
import {
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Music,
  FileText,
  Disc3,
  Upload,
  Plus,
  ChevronDown,
  Filter,
} from 'lucide-react';

type ViewMode = 'table' | 'grid';
type SortField = 'title' | 'artist' | 'work_date' | 'status' | 'cst_id';
type FilterField = 'composition_status' | 'publishing_status' | 'master_status' | 'release_status' | 'registration_status';

interface CatalogViewProps {
  works: Work[];
  loading: boolean;
  onWorkClick: (work: Work) => void;
  onNewWork: () => void;
  onImportCSV: () => void;
}

const STATUS_DIMENSIONS = [
  { key: 'composition_status' as const, label: 'Composition', icon: Music },
  { key: 'publishing_status' as const, label: 'Publishing', icon: FileText },
  { key: 'master_status' as const, label: 'Master', icon: Disc3 },
  { key: 'release_status' as const, label: 'Release', icon: Upload },
];

export function CatalogView({ works, loading, onWorkClick, onNewWork, onImportCSV }: CatalogViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('work_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterField, string>>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredWorks = useMemo(() => {
    let result = works;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(q) ||
          w.artist?.toLowerCase().includes(q) ||
          w.isrc?.toLowerCase().includes(q) ||
          w.iswc?.toLowerCase().includes(q) ||
          w.cst_id?.toLowerCase().includes(q),
      );
    }

    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value) {
        result = result.filter((w) => w[field as keyof Work] === value);
      }
    });

    result = [...result].sort((a, b) => {
      let aVal: string | null = '';
      let bVal: string | null = '';

      if (sortField === 'title') {
        aVal = a.title;
        bVal = b.title;
      } else if (sortField === 'artist') {
        aVal = a.artist;
        bVal = b.artist;
      } else if (sortField === 'work_date') {
        aVal = a.work_date;
        bVal = b.work_date;
      } else if (sortField === 'status') {
        aVal = a.status;
        bVal = b.status;
      } else if (sortField === 'cst_id') {
        aVal = a.cst_id;
        bVal = b.cst_id;
      }

      if (!aVal) return 1;
      if (!bVal) return -1;
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [works, search, sortField, sortDir, activeFilters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleFilter = (field: FilterField, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? undefined : value,
    }));
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-ink-400">Loading catalog...</div>
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100">
            <Disc3 className="h-8 w-8 text-ink-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-ink-900">Your catalog starts here</h2>
          <p className="mb-6 max-w-sm text-sm text-ink-500">
            Add your first works and CST will automatically organize their information.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onNewWork} className="btn-primary">
              <Plus className="h-4 w-4" />
              New work
            </button>
            <button onClick={onImportCSV} className="btn-secondary">
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-ink-100 px-6 py-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, artist, ISRC, ISWC, CST ID..."
            className="input pl-9"
          />
        </div>

        {/* Filters */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'btn-secondary',
              activeFilterCount > 0 && 'border-brand-300 bg-brand-50 text-brand-700',
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-md bg-brand-100 px-1.5 text-xs font-semibold text-brand-700">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showFilters && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-ink-200 bg-white p-4 shadow-modal">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Filter by status
                </p>
                <div className="space-y-3">
                  {STATUS_DIMENSIONS.map(({ key, label, icon: Icon }) => (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-600">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['confirmed', 'partial', 'missing', 'not_checked'].map((status) => (
                          <button
                            key={status}
                            onClick={() => toggleFilter(key, status)}
                            className={cn(
                              'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                              activeFilters[key] === status
                                ? 'border-brand-400 bg-brand-50 text-brand-700'
                                : 'border-ink-200 text-ink-500 hover:bg-ink-50',
                            )}
                          >
                            {status === 'confirmed' && 'Confirmed'}
                            {status === 'partial' && 'Partial'}
                            {status === 'missing' && 'Missing'}
                            {status === 'not_checked' && 'Not checked'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setActiveFilters({})}
                    className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-ink-400" />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-sm font-medium text-ink-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="work_date">Date</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="status">Status</option>
            <option value="cst_id">CST ID</option>
          </select>
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="rounded-lg border border-ink-200 px-2.5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-ink-200 bg-white p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'table' ? 'bg-ink-100 text-ink-700' : 'text-ink-400 hover:text-ink-600',
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid' ? 'bg-ink-100 text-ink-700' : 'text-ink-400 hover:text-ink-600',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="px-6 py-2 text-xs text-ink-400">
        {filteredWorks.length} {filteredWorks.length === 1 ? 'work' : 'works'}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {viewMode === 'table' ? (
          <TableView works={filteredWorks} onWorkClick={onWorkClick} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
        ) : (
          <GridView works={filteredWorks} onWorkClick={onWorkClick} />
        )}
      </div>
    </div>
  );
}

function TableView({
  works,
  onWorkClick,
  sortField,
  sortDir,
  onSort,
}: {
  works: Work[];
  onWorkClick: (work: Work) => void;
  sortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/50">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              Cover
            </th>
            <SortHeader field="title" label="Work" sortField={sortField} sortDir={sortDir} onSort={onSort} />
            <SortHeader field="artist" label="Artist" sortField={sortField} sortDir={sortDir} onSort={onSort} />
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              Composer
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              ISRC
            </th>
            <SortHeader field="cst_id" label="CST ID" sortField={sortField} sortDir={sortDir} onSort={onSort} />
          </tr>
        </thead>
        <tbody>
          {works.map((work) => {
            const completeness = computeCompleteness(work);
            return (
              <tr
                key={work.id}
                onClick={() => onWorkClick(work)}
                className="cursor-pointer border-b border-ink-50 transition-colors last:border-0 hover:bg-ink-50/50"
              >
                <td className="px-4 py-3">
                  <Cover url={work.cover_url} title={work.title} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-sm font-medium text-ink-900">{work.title}</div>
                      {work.featuring && (
                        <div className="text-xs text-ink-400">ft. {work.featuring}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-ink-700">{work.artist || '--'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-ink-500">
                    {work.composition_status === 'confirmed' ? 'Identified' : work.composition_status === 'partial' ? 'Partial' : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={work.composition_status} label="" showIcon={false} />
                    <div className="flex items-center gap-1.5">
                      {STATUS_DIMENSIONS.map(({ key, label, icon: Icon }) => (
                        <Tooltip key={key} content={`${label}: ${work[key]}`}>
                          <span>
                            <StatusIndicator label="" status={work[key]} icon={Icon} />
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {work.isrc ? (
                    <span className="font-mono text-xs text-ink-600">{work.isrc}</span>
                  ) : (
                    <span className="text-xs text-ink-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-ink-500">{work.cst_id}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === field;
  return (
    <th className="px-4 py-2.5 text-left">
      <button
        onClick={() => onSort(field)}
        className={cn(
          'flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors',
          isActive ? 'text-brand-600' : 'text-ink-500 hover:text-ink-700',
        )}
      >
        {label}
        {isActive && <ChevronDown className={cn('h-3 w-3', sortDir === 'asc' && 'rotate-180')} />}
      </button>
    </th>
  );
}

function GridView({ works, onWorkClick }: { works: Work[]; onWorkClick: (work: Work) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {works.map((work) => {
        const completeness = computeCompleteness(work);
        return (
          <button
            key={work.id}
            onClick={() => onWorkClick(work)}
            className="group flex flex-col overflow-hidden rounded-xl border border-ink-200 bg-white text-left shadow-card transition-all hover:shadow-card-hover hover:border-ink-300"
          >
            {/* Cover */}
            <div className="relative aspect-square overflow-hidden bg-ink-100">
              <Cover url={work.cover_url} title={work.title} size="xl" className="!h-full !w-full !rounded-none" />
              <div className="absolute right-2 top-2">
                <StatusBadge status={work.composition_status} label="" showIcon={false} />
              </div>
              <div className="absolute bottom-2 left-2 rounded-md bg-ink-900/70 px-2 py-0.5 backdrop-blur-sm">
                <span className="font-mono text-xs text-white">{work.cst_id}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 p-3.5">
              <div>
                <h3 className="truncate text-sm font-semibold text-ink-900">{work.title}</h3>
                <p className="truncate text-xs text-ink-500">
                  {work.artist}
                  {work.featuring && ` ft. ${work.featuring}`}
                </p>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-2 border-t border-ink-50 pt-2">
                {STATUS_DIMENSIONS.map(({ key, label, icon: Icon }) => (
                  <Tooltip key={key} content={`${label}: ${work[key]}`}>
                    <span>
                      <StatusIndicator label="" status={work[key]} icon={Icon} />
                    </span>
                  </Tooltip>
                ))}
              </div>

              {/* ISRC */}
              {work.isrc && (
                <div className="font-mono text-xs text-ink-400">{work.isrc}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
