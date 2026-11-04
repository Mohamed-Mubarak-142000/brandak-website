import Link from 'next/link';

import type { ProductSort } from '@/lib/api';

import { hrefWith, SORTS, type SearchParams } from './params';

/** Sort as plain links (a horizontal rail on phones). Changing the sort goes back to page 1. */
export function SortLinks({ path, searchParams, current }: { path: string; searchParams: SearchParams; current: ProductSort }) {
  return (
    <nav aria-label="الترتيب" className="rail -mx-4 mb-5 overflow-x-auto px-4">
      <ul className="flex w-max gap-2">
        {SORTS.map((s) => {
          const on = s.value === current;
          return (
            <li key={s.value}>
              <Link
                href={hrefWith(path, searchParams, { sort: s.value === 'newest' ? undefined : s.value, page: undefined })}
                aria-current={on ? 'true' : undefined}
                className={
                  on
                    ? 'inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-ui font-bold text-ground'
                    : 'inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-ui font-semibold text-ink-2 hover:border-brand hover:text-ink'
                }
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
