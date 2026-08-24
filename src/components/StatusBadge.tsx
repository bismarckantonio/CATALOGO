import type { StatusLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Minus, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusLevel;
  label?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<StatusLevel, { label: string; classes: string; Icon: typeof Check }> = {
  confirmed: { label: 'Confirmed', classes: 'bg-success-50 text-success-700 border border-success-200', Icon: Check },
  partial: { label: 'Partial', classes: 'bg-warning-50 text-warning-700 border border-warning-200', Icon: AlertCircle },
  needs_review: { label: 'Needs review', classes: 'bg-warning-50 text-warning-700 border border-warning-200', Icon: AlertCircle },
  manual: { label: 'Manual', classes: 'bg-brand-50 text-brand-700 border border-brand-200', Icon: Check },
  not_checked: { label: 'Not checked', classes: 'bg-ink-100 text-ink-500 border border-ink-200', Icon: HelpCircle },
  missing: { label: 'Missing', classes: 'bg-ink-100 text-ink-500 border border-ink-200', Icon: Minus },
};

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  const { Icon } = config;

  return (
    <span className={cn('badge', config.classes)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label || config.label}
    </span>
  );
}

export function StatusDot({ status }: { status: StatusLevel }) {
  const colorMap: Record<StatusLevel, string> = {
    confirmed: 'bg-success-500',
    partial: 'bg-warning-500',
    needs_review: 'bg-warning-500',
    manual: 'bg-brand-500',
    not_checked: 'bg-ink-300',
    missing: 'bg-ink-300',
  };

  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', colorMap[status] || 'bg-ink-300')}
      title={STATUS_CONFIG[status]?.label || status}
    />
  );
}

export function StatusIndicator({
  label,
  status,
  icon: Icon,
}: {
  label: string;
  status: StatusLevel;
  icon: typeof Check;
}) {
  const { Icon: StatusIcon } = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  const colorMap: Record<StatusLevel, string> = {
    confirmed: 'text-success-600',
    partial: 'text-warning-600',
    needs_review: 'text-warning-600',
    manual: 'text-brand-600',
    not_checked: 'text-ink-400',
    missing: 'text-ink-400',
  };

  return (
    <div className="flex items-center gap-1.5" title={`${label}: ${STATUS_CONFIG[status]?.label || status}`}>
      <Icon className={cn('h-3.5 w-3.5', colorMap[status] || 'text-ink-400')} />
      <span className={cn('text-xs font-medium', colorMap[status] || 'text-ink-400')}>
        {label}
      </span>
      <StatusIcon className={cn('h-3 w-3', colorMap[status] || 'text-ink-400')} />
    </div>
  );
}

export function RefreshBadge() {
  return (
    <span className="badge bg-brand-50 text-brand-600 border border-brand-100">
      <RefreshCw className="h-3 w-3" />
      Auto-enriched
    </span>
  );
}
