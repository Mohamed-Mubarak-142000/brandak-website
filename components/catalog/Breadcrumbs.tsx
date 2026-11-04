import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  href?: string;
}

/** "الرئيسية ‹ ملابس ‹ رجالي". The last crumb is the current page unless it has an href. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="مسار الصفحة" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-x-1 text-meta text-ink-3 sm:text-ui">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 ? <ChevronLeft aria-hidden className="size-3.5 shrink-0 text-ink-3/70" /> : null}
            {c.href ? (
              <Link href={c.href} className="inline-flex min-h-8 items-center rounded-md transition-colors hover:text-accent">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[14rem] truncate font-semibold text-ink-2 sm:max-w-md">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
