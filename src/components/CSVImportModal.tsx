import { useState } from 'react';
import { Modal } from './Modal';
import { cn } from '@/lib/utils';
import { createWork } from '@/lib/api';
import type { Work } from '@/lib/types';
import {
  Upload,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Search,
} from 'lucide-react';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = 'upload' | 'preview' | 'mapping' | 'matching' | 'conflicts' | 'done';

const CST_FIELDS = [
  { key: 'title', label: 'Title', required: true },
  { key: 'artist', label: 'Artist' },
  { key: 'isrc', label: 'ISRC' },
  { key: 'iswc', label: 'ISWC' },
  { key: 'composer', label: 'Composer' },
  { key: 'publisher', label: 'Publisher' },
  { key: 'producer', label: 'Producer' },
  { key: 'featuring', label: 'Featuring' },
  { key: 'album', label: 'Album' },
  { key: 'label', label: 'Label' },
  { key: 'genre', label: 'Genre' },
  { key: 'release_date', label: 'Release Date' },
  { key: 'duration', label: 'Duration' },
  { key: 'bpm', label: 'BPM' },
  { key: 'language', label: 'Language' },
  { key: '_skip', label: '— Skip —' },
];

const SAMPLE_CSV = `Track Name,Artist,ISRC,Writer,Publisher,Album
Midnight Avenue,Sofia Reyes,USRC12400001,Marcus Cole,Cole Publishing,Neon Horizons
Gravity,The Paper Kites,AURD23004002,Sam Bentley,Bentley Music,Waves EP
Desert Bloom,Elena Vargas,ESRC24003003,Elena Vargas,Vargas Music,Tierra del Sol`;

interface ParsedRow {
  [key: string]: string;
}

interface ConflictItem {
  row: ParsedRow;
  field: string;
  csvValue: string;
  externalValue: string;
}

export function CSVImportModal({ open, onClose, onImported }: CSVImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (content: string, name: string) => {
    setFileName(name);
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return;

    const parsedHeaders = parseCSVLine(lines[0]);
    const parsedRows = lines.slice(1, 6).map((line) => {
      const values = parseCSVLine(line);
      const row: ParsedRow = {};
      parsedHeaders.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return row;
    });

    setHeaders(parsedHeaders);
    setRows(parsedRows);

    const autoMapping: Record<string, string> = {};
    parsedHeaders.forEach((h) => {
      const lower = h.toLowerCase().trim();
      const match = CST_FIELDS.find((f) => {
        const fl = f.label.toLowerCase();
        return lower === fl || lower.includes(fl) || fl.includes(lower);
      });
      autoMapping[h] = match ? match.key : '_skip';
    });
    setMapping(autoMapping);
    setStep('preview');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleFile(ev.target?.result as string, file.name);
    };
    reader.readAsText(file);
  };

  const useSampleData = () => {
    handleFile(SAMPLE_CSV, 'sample-catalog.csv');
  };

  const handleMatching = () => {
    setStep('matching');
    setTimeout(() => {
      const detectedConflicts: ConflictItem[] = [];
      if (rows.length > 2) {
        const thirdRow = rows[2];
        if (thirdRow['Artist']) {
          detectedConflicts.push({
            row: thirdRow,
            field: 'artist',
            csvValue: thirdRow['Artist'],
            externalValue: `${thirdRow['Artist']} ft. Carlos Mendez`,
          });
        }
      }
      setConflicts(detectedConflicts);
      setStep('conflicts');
    }, 1800);
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    try {
      let count = 0;
      for (const row of rows) {
        const workData: Record<string, string> = {};
        Object.entries(mapping).forEach(([csvCol, cstField]) => {
          if (cstField !== '_skip' && row[csvCol]) {
            workData[cstField] = row[csvCol];
          }
        });

        if (workData.title) {
          const composerName = workData.composer;
          const contributors = composerName
            ? [{ name: composerName, role: 'Composer', split_percentage: 100, publisher: workData.publisher || null }]
            : [];
          const { composer: _composer, publisher: _publisher, ...workFields } = workData;
          void _composer;
          void _publisher;
          await createWork(workFields as Partial<Work>, contributors);
          count++;
        }
      }
      setImportCount(count);
      setStep('done');
      setTimeout(() => {
        onImported();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import works');
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setConflicts([]);
    setImporting(false);
    setImportCount(0);
    setError(null);
    onClose();
  };

  const stepIndex = ['upload', 'preview', 'mapping', 'matching', 'conflicts', 'done'].indexOf(step);

  return (
    <Modal open={open} onClose={handleClose} size="xl">
      <div className="border-b border-ink-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-ink-900">Import works</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          {step === 'done'
            ? 'Import completed successfully'
            : 'Upload a CSV file and map columns to CST fields.'}
        </p>
      </div>

      {step !== 'done' && (
        <div className="flex items-center gap-1 border-b border-ink-100 px-6 py-3">
          {['Upload', 'Preview', 'Mapping', 'Matching', 'Conflicts'].map((label, i) => (
            <div key={label} className="flex items-center">
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
                  stepIndex === i
                    ? 'bg-brand-50 text-brand-700'
                    : stepIndex > i
                      ? 'text-ink-700'
                      : 'text-ink-400',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                    stepIndex === i
                      ? 'bg-brand-600 text-white'
                      : stepIndex > i
                        ? 'bg-success-500 text-white'
                        : 'bg-ink-200 text-ink-500',
                  )}
                >
                  {stepIndex > i ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </span>
              {i < 4 && <div className="mx-1 h-px w-4 bg-ink-200" />}
            </div>
          ))}
        </div>
      )}

      <div className="px-6 py-5">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {step === 'upload' && (
          <div>
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 px-6 py-12 text-center cursor-pointer transition-colors hover:border-brand-400 hover:bg-brand-50/30">
              <Upload className="mb-3 h-8 w-8 text-ink-300" />
              <p className="text-sm font-medium text-ink-700">Drag your CSV file here</p>
              <p className="mt-1 text-xs text-ink-400">or click to browse</p>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </label>
            <div className="mt-4 flex items-center justify-center">
              <button onClick={useSampleData} className="btn-ghost text-xs">
                <FileText className="h-3.5 w-3.5" />
                Use sample data (DEMO)
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
              <p className="font-medium text-ink-600">Expected columns (optional):</p>
              <p className="mt-1">Track Name, Artist, ISRC, ISWC, Writer, Publisher, Producer, Album, Label, Genre, Release Date</p>
              <p className="mt-1.5 text-ink-400">CST will auto-detect columns. You only need a title to import.</p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-ink-600">
              <FileText className="h-4 w-4 text-ink-400" />
              <span className="font-medium">{fileName}</span>
              <span className="text-ink-400">· {rows.length} rows previewed</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-ink-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-ink-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-ink-50 last:border-0">
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-xs text-ink-700">
                          {row[h] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div>
            <p className="mb-4 text-sm text-ink-600">
              Map your CSV columns to CST fields. CST auto-detected the most likely matches.
            </p>
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h} className="flex items-center gap-3 rounded-lg border border-ink-100 p-3">
                  <div className="flex-1">
                    <div className="text-xs font-medium text-ink-400">CSV column</div>
                    <div className="text-sm font-medium text-ink-800">{h}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-300" />
                  <select
                    value={mapping[h] || '_skip'}
                    onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })}
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    {CST_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'matching' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-600" />
            <p className="text-sm font-medium text-ink-700">Searching for matches...</p>
            <p className="mt-1 text-xs text-ink-400">CST is trying to identify works and enrich data</p>
          </div>
        )}

        {step === 'conflicts' && (
          <div>
            {conflicts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700">
                  <AlertCircle className="h-4 w-4" />
                  Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} between CSV and external data
                </div>
                {conflicts.map((conflict, i) => (
                  <div key={i} className="rounded-lg border border-warning-200 bg-warning-50/50 p-3">
                    <div className="mb-2 text-sm font-medium text-ink-700">
                      Different information found for: <span className="capitalize">{conflict.field}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-white p-2">
                        <div className="text-xs font-medium text-ink-400">CSV</div>
                        <div className="text-sm text-ink-800">{conflict.csvValue}</div>
                      </div>
                      <div className="rounded-md bg-white p-2">
                        <div className="text-xs font-medium text-ink-400">External (DEMO)</div>
                        <div className="text-sm text-ink-800">{conflict.externalValue}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button className="btn-secondary text-xs">Keep CSV</button>
                      <button className="btn-secondary text-xs">Use external</button>
                      <button className="btn-ghost text-xs">Review manually</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Check className="mb-3 h-8 w-8 text-success-500" />
                <p className="text-sm font-medium text-ink-700">No conflicts detected</p>
                <p className="mt-1 text-xs text-ink-400">All data is consistent. Ready to import.</p>
              </div>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
              <Check className="h-7 w-7 text-success-600" />
            </div>
            <h3 className="text-base font-semibold text-ink-900">Import complete</h3>
            <p className="mt-1 text-sm text-ink-500">{importCount} work{importCount !== 1 ? 's' : ''} imported successfully</p>
          </div>
        )}
      </div>

      {step !== 'done' && step !== 'matching' && (
        <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4">
          <div>
            {stepIndex > 0 && (
              <button
                onClick={() => setStep(['upload', 'preview', 'mapping', 'matching', 'conflicts'][stepIndex - 1] as Step)}
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
            {step === 'upload' && null}
            {step === 'preview' && (
              <button onClick={() => setStep('mapping')} className="btn-primary">
                Continue to mapping
              </button>
            )}
            {step === 'mapping' && (
              <button onClick={handleMatching} className="btn-primary">
                <Search className="h-4 w-4" />
                Match works
              </button>
            )}
            {step === 'conflicts' && (
              <button onClick={handleImport} disabled={importing} className="btn-primary">
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Import {rows.length} works
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
