import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { num } from '@/lib/format';

type Query = Record<string, string | number | undefined>;

/** `path?a=1&b=2`, dropping empty values and page 1. */
export function hrefWith(path: string, query: Query) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === '' || (k === 'page' && Number(v) <= 1)) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

/** Previous / next links with "صفحة ٢ من ٥". In RTL "previous" points right. */
export function Pagination({ path, query, page, total, limit }: { path: string; query: Query; page: number; total: number; limit: number }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const link = 'inline-flex min-h-11 items-center gap-1 rounded-full border border-line-strong bg-surface px-4 font-bold hover:border-brand';
  return (
    <nav aria-label="الصفحات" className="mt-10 flex items-center justify-between gap-3 text-ui">
      {page > 1 ? (
        <Link href={hrefWith(path, { ...query, page: page - 1 })} rel="prev" className={link}>
          <ChevronRight aria-hidden className="size-4" />
          السابق
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink-2">
        صفحة {num(page)} من {num(pages)}
      </span>
      {page < pages ? (
        <Link href={hrefWith(path, { ...query, page: page + 1 })} rel="next" className={link}>
          التالي
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** Positive integer from a search param, else 1. */
export const pageParam = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 1 ? n : 1;
};

export const stringParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? '';
