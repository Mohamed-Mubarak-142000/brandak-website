import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

import { hrefWith, totalPages, type SearchParams } from './params';

/** 1 … 4 5 6 … 12: the first and last page, the current one and its neighbours. */
function pageList(page: number, pages: number): (number | 'gap')[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

const box = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full text-ui font-bold transition-colors';

/** Numbered pages with previous / next. Keeps every other query param. Hidden when there's one page. */
export function Pagination({ path, searchParams, page, total, limit }: { path: string; searchParams: SearchParams; page: number; total: number; limit: number }) {
  const pages = totalPages(total, limit);
  if (pages <= 1) return null;
  const at = (p: number) => hrefWith(path, searchParams, { page: p > 1 ? p : undefined });

  return (
    <nav aria-label="الصفحات" className="mt-12 flex flex-col items-center gap-3">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={at(page - 1)} rel="prev" className={cn(box, 'border border-line px-4 hover:border-brand hover:text-accent')}>
              <ChevronRight aria-hidden className="size-4" />
              <span className="hidden sm:inline">اللي قبلها</span>
              <span className="sr-only sm:hidden">الصفحة اللي قبلها</span>
            </Link>
          ) : (
            <span aria-hidden className={cn(box, 'border border-line px-4 text-ink-3/60')}>
              <ChevronRight className="size-4" />
              <span className="hidden sm:inline">اللي قبلها</span>
            </span>
          )}
        </li>
        {pageList(page, pages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-ink-3">
              …
            </li>
          ) : (
            <li key={p}>
              {p === page ? (
                <span aria-current="page" className={cn(box, 'bg-ink text-ground')}>
                  <span className="sr-only">صفحة </span>
                  {num(p)}
                </span>
              ) : (
                <Link href={at(p)} className={cn(box, 'text-ink-2 hover:bg-sunken hover:text-ink')}>
                  <span className="sr-only">صفحة </span>
                  {num(p)}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {page < pages ? (
            <Link href={at(page + 1)} rel="next" className={cn(box, 'border border-line px-4 hover:border-brand hover:text-accent')}>
              <span className="hidden sm:inline">اللي بعدها</span>
              <span className="sr-only sm:hidden">الصفحة اللي بعدها</span>
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(box, 'border border-line px-4 text-ink-3/60')}>
              <span className="hidden sm:inline">اللي بعدها</span>
              <ChevronLeft className="size-4" />
            </span>
          )}
        </li>
      </ul>
      <p className="text-meta text-ink-3">
        صفحة {num(page)} من {num(pages)}
      </p>
    </nav>
  );
}
