import Link from 'next/link';

import { categoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/cn';
import type { Category } from '@/lib/types';

/**
 * Categories as pill links. `rail` keeps them on one scrollable row (listing headers); `wrap` lets
 * them flow onto more lines; `tiles` shows them as an icon grid (search with no query).
 */
export function CategoryChips({ categories, label, layout = 'rail' }: { categories: Category[]; label: string; layout?: 'rail' | 'wrap' | 'tiles' }) {
  if (!categories.length) return null;

  if (layout === 'tiles') {
    return (
      <nav aria-label={label}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = categoryIcon(c.icon);
            return (
              <li key={c._id}>
                <Link
                  href={`/category/${c._id}`}
                  className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface p-3 text-center transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span className="text-ui font-bold transition-colors group-hover:text-accent">{c.nameAr}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={label} className={layout === 'rail' ? 'rail -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6' : undefined}>
      <ul className={cn('flex gap-2', layout === 'rail' ? 'w-max' : 'flex-wrap')}>
        {categories.map((c) => {
          const Icon = categoryIcon(c.icon);
          return (
            <li key={c._id}>
              <Link
                href={`/category/${c._id}`}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-ui font-semibold text-ink-2 transition-colors hover:border-brand hover:text-ink"
              >
                <Icon aria-hidden className="size-4 text-accent" />
                {c.nameAr}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
