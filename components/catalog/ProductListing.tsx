import { SlidersHorizontal } from 'lucide-react';

import { ProductCard } from '@/components/ProductCard';
import { num } from '@/lib/format';
import type { ProductCard as Product, StoreType } from '@/lib/types';

import { ActiveFilters, activeFilters, FilterForm } from './Filters';
import { FilterDrawer } from './FilterDrawer';
import { Pagination } from './Pagination';
import { hrefWith, SORTS, type ProductFilters, type SearchParams } from './params';
import { SortMenu } from './SortMenu';

/**
 * The shared listing layout for category and search pages: a sticky filters sidebar on desktop (a
 * drawer on phones), a toolbar with the count and sort, active-filter chips, the grid and pages.
 */
export function ProductListing({
  path,
  searchParams,
  filters,
  storeTypes,
  keep,
  clearHref,
  items,
  total,
  page,
  limit,
  empty,
}: {
  path: string;
  searchParams: SearchParams;
  filters: ProductFilters;
  storeTypes?: StoreType[];
  /** Params the filter form doesn't show but must keep, e.g. the search query. */
  keep?: Record<string, string | undefined>;
  /** Where "امسح الفلاتر" goes. */
  clearHref: string;
  items: Product[];
  total: number;
  page: number;
  limit: number;
  empty: React.ReactNode;
}) {
  const formKeep = { ...keep, sort: filters.sort === 'newest' ? undefined : filters.sort };
  const form = <FilterForm path={path} filters={filters} storeTypes={storeTypes} keep={formKeep} clearHref={clearHref} />;
  const sorts = SORTS.map((s) => ({ ...s, href: hrefWith(path, searchParams, { sort: s.value === 'newest' ? undefined : s.value, page: undefined }) }));
  const activeCount = activeFilters(filters).length;

  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <aside aria-labelledby="filters-title" className="hidden lg:sticky lg:top-44 lg:block">
        <div className="rounded-panel border border-line bg-surface p-5">
          <h2 id="filters-title" className="mb-4 flex items-center gap-2 text-body font-extrabold">
            <SlidersHorizontal aria-hidden className="size-4 text-ink-3" />
            الفلاتر
          </h2>
          {form}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-ui text-ink-2" aria-live="polite">
            {total > 0 ? (
              <>
                <strong className="font-extrabold text-ink">{num(total)}</strong> منتج
              </>
            ) : (
              'مفيش منتجات'
            )}
          </p>
          <div className="flex items-center gap-2">
            <FilterDrawer count={activeCount}>{form}</FilterDrawer>
            {total > 1 ? <SortMenu options={sorts} current={filters.sort} /> : null}
          </div>
        </div>

        {activeCount ? (
          <div className="mt-4">
            <ActiveFilters path={path} searchParams={searchParams} filters={filters} clearHref={clearHref} />
          </div>
        ) : null}

        <div className="mt-5">
          {items.length ? (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {items.map((p, i) => (
                  <li key={p.id} className="min-w-0">
                    <ProductCard product={p} priority={i < 4} />
                  </li>
                ))}
              </ul>
              <Pagination path={path} searchParams={searchParams} page={page} total={total} limit={limit} />
            </>
          ) : (
            empty
          )}
        </div>
      </div>
    </div>
  );
}
