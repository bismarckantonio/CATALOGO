import type { StatusLevel, Work, WorkContributor, WorkOrganization } from './types';

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: string | null): string {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function shortDate(date: string | null): string {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getComposers(contributors: WorkContributor[]): WorkContributor[] {
  return contributors.filter((c) =>
    ['Composer', 'Writer', 'Co-Writer', 'Lyricist', 'Topliner', 'Arranger'].includes(c.role),
  );
}

export function getSplitTotal(contributors: WorkContributor[]): number {
  return getComposers(contributors).reduce((sum, c) => sum + (c.split_percentage || 0), 0);
}

export function isSplitComplete(contributors: WorkContributor[]): boolean {
  return getSplitTotal(contributors) === 100;
}

export function computeCompleteness(work: Work): number {
  const dimensions: StatusLevel[] = [
    work.composition_status,
    work.publishing_status,
    work.master_status,
    work.release_status,
    work.registration_status,
    work.metadata_status,
  ];

  const weights: Record<StatusLevel, number> = {
    confirmed: 100,
    partial: 50,
    needs_review: 50,
    manual: 80,
    not_checked: 0,
    missing: 0,
  };

  const total = dimensions.reduce((sum, s) => sum + (weights[s] || 0), 0);
  return Math.round(total / dimensions.length);
}

export function getOpportunityAlerts(work: Work): { message: string; action: string; severity: 'warning' | 'info' }[] {
  const alerts: { message: string; action: string; severity: 'warning' | 'info' }[] = [];

  if (work.composition_status === 'confirmed' && work.publishing_status === 'missing') {
    alerts.push({
      message: 'This work has an identified composition, but we don\'t have enough information about its publishing registration.',
      action: 'Complete publishing',
      severity: 'warning',
    });
  }

  if (work.master_status === 'confirmed' && work.release_status === 'confirmed' && work.registration_status === 'missing') {
    alerts.push({
      message: 'This recording appears to be published, but we haven\'t confirmed its registration with associated organizations.',
      action: 'Review organizations',
      severity: 'warning',
    });
  }

  if (work.isrc && work.master_status === 'missing') {
    alerts.push({
      message: 'This work has an ISRC but no master/recording information associated.',
      action: 'Add master info',
      severity: 'info',
    });
  }

  if (work.release_status === 'confirmed' && !work.upc) {
    alerts.push({
      message: 'This work has a release but no UPC/EAN identifier.',
      action: 'Add UPC',
      severity: 'info',
    });
  }

  return alerts;
}

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    manual: 'Manual',
    csv: 'CSV Import',
    deezer: 'Deezer',
    the_mlc: 'The MLC',
    ascap: 'ASCAP',
    bmi: 'BMI',
    sesac: 'SESAC',
  };
  return labels[source] || source;
}

export function generateCstId(existingIds: string[]): string {
  const maxNum = existingIds.reduce((max, id) => {
    const match = id.match(/CST-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `CST-${String(maxNum + 1).padStart(6, '0')}`;
}

export function getOrgStatusInfo(status: string): { label: string; classes: string } {
  const map: Record<string, { label: string; classes: string }> = {
    confirmed: { label: 'Confirmed', classes: 'bg-success-50 text-success-700 border border-success-200' },
    manual: { label: 'Manual', classes: 'bg-brand-50 text-brand-700 border border-brand-200' },
    not_found: { label: 'Not found', classes: 'bg-danger-50 text-danger-700 border border-danger-200' },
    not_checked: { label: 'Not checked', classes: 'bg-ink-100 text-ink-500 border border-ink-200' },
    missing: { label: 'Missing', classes: 'bg-warning-50 text-warning-700 border border-warning-200' },
  };
  return map[status] || { label: status, classes: 'bg-ink-100 text-ink-500 border border-ink-200' };
}

export function getOrgStatusBadgeClasses(color: string): string {
  const map: Record<string, string> = {
    success: 'bg-success-50 text-success-700 border border-success-200',
    brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    danger: 'bg-danger-50 text-danger-700 border border-danger-200',
    ink: 'bg-ink-100 text-ink-500 border border-ink-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
  };
  return map[color] || map.ink;
}
