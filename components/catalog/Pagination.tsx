import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { num } from '@/lib/format';

import { hrefWith, totalPages, type SearchParams } from './params';

/** Previous / next with "صفحة x من y". Keeps every other query param. Hidden when there's one page. */
export function Pagination({ path, searchParams, page, total, limit }: { path: string; searchParams: SearchParams; page: number; total: number; limit: number }) {
  const pages = totalPages(total, limit);
  if (pages <= 1) return null;
  const link = 'inline-flex min-h-11 items-center gap-1 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold hover:border-brand';
  const off = 'inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-4 text-ui font-bold text-ink-3';
  const prev = page > 1 ? hrefWith(path, searchParams, { page: page - 1 > 1 ? page - 1 : undefined }) : null;
  const next = page < pages ? hrefWith(path, searchParams, { page: page + 1 }) : null;

  return (
    <nav aria-label="الصفحات" className="mt-10 flex items-center justify-between gap-3">
      {prev ? (
        <Link href={prev} rel="prev" className={link}>
          <ChevronRight aria-hidden className="size-4" />
          اللي قبلها
        </Link>
      ) : (
        <span aria-hidden className={off}>
          <ChevronRight className="size-4" />
          اللي قبلها
        </span>
      )}
      <span className="text-ui text-ink-2" aria-current="page">
        صفحة {num(page)} من {num(pages)}
      </span>
      {next ? (
        <Link href={next} rel="next" className={link}>
          اللي بعدها
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={off}>
          اللي بعدها
          <ChevronLeft className="size-4" />
        </span>
      )}
    </nav>
  );
}
