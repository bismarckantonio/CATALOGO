import type { WorkWithRelations } from '@/lib/types';
import { getComposers, getSplitTotal, isSplitComplete, formatDate, cn } from '@/lib/utils';
import { Disc3, X, Printer } from 'lucide-react';

interface SplitSheetProps {
  work: WorkWithRelations;
  onClose: () => void;
}

export function SplitSheet({ work, onClose }: SplitSheetProps) {
  const composers = getComposers(work.contributors);
  const total = getSplitTotal(work.contributors);
  const isComplete = isSplitComplete(work.contributors);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/30 p-4 backdrop-blur-sm">
      <div className="relative z-10 max-h-[calc(100vh-4rem)] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-modal">
        {/* Toolbar (not printed) */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-3">
          <h2 className="text-sm font-semibold text-ink-900">Split Sheet</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn-primary text-xs">
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="btn-ghost">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable document */}
        <div className="printable-split-sheet p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-ink-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900">
                <Disc3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink-900">CST — Split Sheet</h1>
                <p className="text-xs text-ink-500">Composition Split Agreement</p>
              </div>
            </div>
            <div className="text-right text-xs text-ink-500">
              <div>Generated: {formatDate(new Date().toISOString())}</div>
              <div className="mt-0.5">CST ID: {work.cst_id}</div>
            </div>
          </div>

          {/* Work info */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Work Title</div>
              <div className="mt-0.5 text-base font-semibold text-ink-900">{work.title}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Date</div>
              <div className="mt-0.5 text-base font-semibold text-ink-900">{formatDate(work.work_date)}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">ISWC</div>
              <div className="mt-0.5 font-mono text-sm text-ink-700">{work.iswc || '—'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">ISRC</div>
              <div className="mt-0.5 font-mono text-sm text-ink-700">{work.isrc || '—'}</div>
            </div>
          </div>

          {/* Composers table */}
          <div className="mt-6">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              Composers, Writers & Splits
            </div>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr className="border-b border-ink-200 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                  <th className="py-2 pr-3">Legal Name</th>
                  <th className="py-2 pr-3">Artist Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">IPI</th>
                  <th className="py-2 pr-3">PRO</th>
                  <th className="py-2 pr-3">Publisher</th>
                  <th className="py-2 pr-3 text-right">Split %</th>
                </tr>
              </thead>
              <tbody>
                {composers.map((c, i) => (
                  <tr key={c.id} className="border-b border-ink-100 text-sm">
                    <td className="py-2.5 pr-3 font-medium text-ink-900">{c.name}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{c.artist_name || '—'}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{c.role}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-ink-600">{c.ipi || '—'}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{c.pro || '—'}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{c.publisher || '—'}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-ink-900">{c.split_percentage}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink-300 text-sm font-semibold">
                  <td colSpan={6} className="py-2.5 pr-3 text-right text-ink-500">Total</td>
                  <td className={cn('py-2.5 pr-3 text-right', isComplete ? 'text-success-600' : 'text-warning-600')}>
                    {total}%
                  </td>
                </tr>
              </tfoot>
            </table>
            {!isComplete && (
              <div className="mt-2 rounded-md bg-warning-50 px-3 py-1.5 text-xs text-warning-700">
                Split is incomplete — total must equal 100%.
              </div>
            )}
          </div>

          {/* Declaration */}
          <div className="mt-8">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Declaration</div>
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              The undersigned certify that the splits listed above accurately represent the agreed-upon
              ownership percentages for the composition titled "{work.title}". Each signer acknowledges
              that their share is correct and authorizes the registration of these splits with the
              appropriate performing rights organizations and mechanical licensing administrators.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            {composers.map((c) => (
              <div key={c.id} className="border-t border-ink-300 pt-2">
                <div className="text-xs font-medium text-ink-700">{c.name}</div>
                <div className="mt-0.5 text-[10px] text-ink-400">Signature</div>
                <div className="mt-8 text-[10px] text-ink-400">Date: _______________</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-ink-200 pt-3 text-center text-[10px] text-ink-400">
            This split sheet was generated by CST — Catalog Studio · {work.cst_id}
          </div>
        </div>
      </div>
    </div>
  );
}
