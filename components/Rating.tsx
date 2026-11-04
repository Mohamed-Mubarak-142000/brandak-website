import { Star } from 'lucide-react';

import { num } from '@/lib/format';

/** "★ ٤٫٥ (١٢)". Nothing when there are no ratings yet: an empty 0 reads as a bad score. */
export function Rating({ avg, count, className }: { avg: number; count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-meta text-ink-2 ${className ?? ''}`}>
      <Star aria-hidden className="size-3.5 fill-brand text-brand" />
      <span className="font-semibold text-ink">{num(Math.round(avg * 10) / 10)}</span>
      <span>({num(count)})</span>
      <span className="sr-only">تقييم من {num(count)}</span>
    </span>
  );
}
