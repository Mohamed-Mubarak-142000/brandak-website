import Link from 'next/link';

import { SearchForm } from '@/components/Header';
import { categoryIcon } from '@/lib/category-icons';
import type { Category } from '@/lib/types';

/** The page's h1 and a big search box, with the first few sections one tap away. */
export function HomeSearch({ sections }: { sections: Category[] }) {
  const quick = sections.slice(0, 6);
  return (
    <section aria-labelledby="home-title" className="mx-auto max-w-3xl text-center">
      <h1 id="home-title" className="text-page font-extrabold sm:text-display">
        بتدوّر على إيه النهارده؟
      </h1>
      <p className="mt-2 text-ui text-ink-2 sm:text-body">براندات ومعارض ومخازن ومحلات مصرية، والدفع كاش عند الاستلام.</p>
      <SearchForm size="lg" className="mt-6" />
      {quick.length ? (
        <ul aria-label="أقسام شائعة" className="mt-4 flex flex-wrap justify-center gap-2">
          {quick.map((c) => {
            const Icon = categoryIcon(c.icon);
            return (
              <li key={c._id}>
                <Link
                  href={`/category/${c._id}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-ui font-semibold text-ink-2 transition-colors hover:border-brand hover:text-ink"
                >
                  <Icon aria-hidden className="size-4 text-brand" />
                  {c.nameAr}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
