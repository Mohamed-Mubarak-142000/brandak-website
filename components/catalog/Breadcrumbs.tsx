import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

/** "الرئيسية ‹ ملابس ‹ رجالي". The last crumb is the current page unless it has an href. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="مسار الصفحة" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 text-meta text-ink-3">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronLeft aria-hidden className="size-3.5 shrink-0" /> : null}
            {c.href ? (
              <Link href={c.href} className="inline-flex min-h-8 items-center hover:text-accent hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink-2">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
