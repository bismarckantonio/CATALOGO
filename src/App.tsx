import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CatalogView } from '@/components/CatalogView';
import { WorkDetail } from '@/components/WorkDetail';
import { NewWorkModal } from '@/components/NewWorkModal';
import { CSVImportModal } from '@/components/CSVImportModal';
import { fetchWorks, fetchWork } from '@/lib/api';
import type { Work, WorkWithRelations } from '@/lib/types';

type View = 'catalog' | 'new-work' | 'import-csv';

function App() {
  const [view, setView] = useState<View>('catalog');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<WorkWithRelations | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newWorkOpen, setNewWorkOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const loadWorks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorks();
      setWorks(data);
    } catch (err) {
      console.error('Failed to load works:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const handleWorkClick = async (work: Work) => {
    setDetailLoading(true);
    try {
      const detail = await fetchWork(work.id);
      if (detail) {
        setSelectedWork(detail);
      }
    } catch (err) {
      console.error('Failed to load work detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleNavigate = (newView: View) => {
    if (newView === 'new-work') {
      setNewWorkOpen(true);
    } else if (newView === 'import-csv') {
      setCsvOpen(true);
    } else {
      setView(newView);
      setSelectedWork(null);
    }
  };

  const handleWorkCreated = () => {
    loadWorks();
    setNewWorkOpen(false);
  };

  const handleCSVImported = () => {
    loadWorks();
    setCsvOpen(false);
  };

  const handleBack = () => {
    setSelectedWork(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar view={view} onNavigate={handleNavigate} workCount={works.length} />

      <main className="flex-1 overflow-hidden">
        {detailLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-ink-400">Loading work...</div>
          </div>
        ) : selectedWork ? (
          <WorkDetail work={selectedWork} onBack={handleBack} onUpdate={loadWorks} />
        ) : (
          <div className="flex h-full flex-col">
            <div className="border-b border-ink-100 bg-white px-6 py-4">
              <h1 className="text-lg font-semibold text-ink-900">Catalog</h1>
              <p className="mt-0.5 text-sm text-ink-500">
                View and manage your musical works, rights, and metadata.
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <CatalogView
                works={works}
                loading={loading}
                onWorkClick={handleWorkClick}
                onNewWork={() => setNewWorkOpen(true)}
                onImportCSV={() => setCsvOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      <NewWorkModal
        open={newWorkOpen}
        onClose={() => setNewWorkOpen(false)}
        onCreated={handleWorkCreated}
      />

      <CSVImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImported={handleCSVImported}
      />
    </div>
  );
}

export default App;
