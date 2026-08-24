import { cn } from '@/lib/utils';
import { Library, Plus, Upload, Settings, Disc3, BarChart3, FileText, HelpCircle } from 'lucide-react';

interface SidebarProps {
  view: 'catalog' | 'new-work' | 'import-csv';
  onNavigate: (view: 'catalog' | 'new-work' | 'import-csv') => void;
  workCount: number;
}

export function Sidebar({ view, onNavigate, workCount }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-ink-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900">
          <Disc3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-ink-900">CST</h1>
          <p className="text-[11px] font-medium text-ink-400">Catalog Studio</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-2">
        <button
          onClick={() => onNavigate('new-work')}
          className="flex w-full items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New work
        </button>
        <button
          onClick={() => onNavigate('import-csv')}
          className="mt-2 flex w-full items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 px-3">
        <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          Menu
        </p>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => onNavigate('catalog')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                view === 'catalog'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
              )}
            >
              <Library className="h-4 w-4" />
              Catalog
              {workCount > 0 && (
                <span className="ml-auto rounded-md bg-ink-100 px-1.5 py-0.5 text-xs font-medium text-ink-500">
                  {workCount}
                </span>
              )}
            </button>
          </li>
          <li>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-50">
              <BarChart3 className="h-4 w-4" />
              Analytics
              <span className="ml-auto rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
                Soon
              </span>
            </button>
          </li>
          <li>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-50">
              <FileText className="h-4 w-4" />
              Documents
              <span className="ml-auto rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
                Soon
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-ink-100 px-3 py-3">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50">
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
      </div>
    </aside>
  );
}
