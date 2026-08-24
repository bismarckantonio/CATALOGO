import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverProps {
  url: string | null | undefined;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 rounded-md',
  md: 'h-14 w-14 rounded-lg',
  lg: 'h-24 w-24 rounded-xl',
  xl: 'h-40 w-40 rounded-2xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function Cover({ url, title, size = 'md', className }: CoverProps) {
  if (url) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden bg-ink-100', sizeClasses[size], className)}>
        <img
          src={url}
          alt={title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-gradient-to-br from-ink-100 to-ink-200',
        sizeClasses[size],
        className,
      )}
    >
      <Music className={cn('text-ink-400', iconSizes[size])} />
    </div>
  );
}
