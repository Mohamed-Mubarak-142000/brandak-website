import { icons, Tag } from 'lucide-react';
import Link from 'next/link';

import type { Category } from '@/lib/types';

/** "shopping-bag" → the ShoppingBag icon; unknown names fall back to a tag. */
function iconFor(name?: string) {
  if (!name) return Tag;
  const key = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase()) as keyof typeof icons;
  return icons[key] ?? Tag;
}

/** Categories as wrapping chips linking to their pages. */
export function CategoryChips({ categories, label }: { categories: Category[]; label: string }) {
  if (!categories.length) return null;
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const Icon = iconFor(c.icon);
          return (
            <li key={c._id}>
              <Link
                href={`/category/${c._id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-ui font-semibold hover:border-brand hover:text-accent"
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
