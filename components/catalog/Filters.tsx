import { SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

import { price } from '@/lib/format';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

import { hrefWith, SORTS, type ProductFilters, type SearchParams } from './params';

const field = 'h-11 w-full rounded-card border border-line-strong bg-surface px-3 text-ui focus:border-brand focus:outline-none';
const check = 'flex min-h-11 cursor-pointer items-center gap-2 text-ui';

/**
 * Product filters as a plain GET form, so they work before (or without) JavaScript. Sort and
 * "اعرض" stay visible; the rest folds into a <details> that starts open when any of it is set.
 */
export function Filters({ path, searchParams, filters, storeTypes }: { path: string; searchParams: SearchParams; filters: ProductFilters; storeTypes?: StoreType[] }) {
  const types = STORE_TYPES.filter((t) => !storeTypes?.length || storeTypes.includes(t.type));
  const active = activeFilters(filters);
  const extraOpen = active.length > 0;

  return (
    <div className="mb-6">
      <form action={path} method="get" className="rounded-panel border border-line bg-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1 sm:max-w-60">
            <span className="mb-1 block text-meta font-semibold text-ink-2">رتّب حسب</span>
            <select name="sort" defaultValue={filters.sort} className={field}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-ui font-bold text-on-accent hover:bg-accent-hover">
            اعرض
          </button>
        </div>

        <details open={extraOpen} className="group mt-3 border-t border-line pt-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-ui font-bold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal aria-hidden className="size-4" />
            فلاتر أكتر
            <span className="text-meta font-normal text-ink-3 group-open:hidden">(السعر، المتوفر، العروض، نوع المتجر)</span>
          </summary>
          <div className="grid gap-5 pb-2 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <fieldset>
              <legend className="mb-1 text-meta font-semibold text-ink-2">السعر بالجنيه</legend>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <span className="sr-only">من</span>
                  <input type="number" name="minPrice" min={0} inputMode="numeric" placeholder="من" defaultValue={filters.minPrice} className={field} />
                </label>
                <span aria-hidden className="text-ink-3">–</span>
                <label className="flex-1">
                  <span className="sr-only">لحد</span>
                  <input type="number" name="maxPrice" min={0} inputMode="numeric" placeholder="لحد" defaultValue={filters.maxPrice} className={field} />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-meta font-semibold text-ink-2">إظهار</legend>
              <label className={check}>
                <input type="checkbox" name="inStock" value="1" defaultChecked={filters.inStock} className="size-5 accent-[var(--accent)]" />
                المتوفر بس
              </label>
              <label className={check}>
                <input type="checkbox" name="onSale" value="1" defaultChecked={filters.onSale} className="size-5 accent-[var(--accent)]" />
                عليه خصم
              </label>
            </fieldset>

            {types.length > 1 ? (
              <fieldset>
                <legend className="mb-1 text-meta font-semibold text-ink-2">نوع المتجر</legend>
                <div className="flex flex-wrap gap-x-4">
                  <label className={check}>
                    <input type="radio" name="storeType" value="" defaultChecked={!filters.storeType} className="size-5 accent-[var(--accent)]" />
                    الكل
                  </label>
                  {types.map((t) => (
                    <label key={t.type} className={check}>
                      <input type="radio" name="storeType" value={t.type} defaultChecked={filters.storeType === t.type} className="size-5 accent-[var(--accent)]" />
                      {t.plural}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
          </div>
        </details>
      </form>

      {active.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <Link
              key={a.key}
              href={hrefWith(path, searchParams, { [a.key]: undefined, page: undefined })}
              className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent-soft px-3 text-meta font-semibold text-accent hover:bg-accent hover:text-on-accent"
              aria-label={`شيل فلتر ${a.label}`}
            >
              {a.label}
              <X aria-hidden className="size-3.5" />
            </Link>
          ))}
          <Link href={path} className="inline-flex min-h-11 items-center px-2 text-ui font-bold text-accent underline-offset-4 hover:underline">
            امسح الفلاتر
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function activeFilters(f: ProductFilters) {
  const out: { key: string; label: string }[] = [];
  if (f.minPrice !== undefined) out.push({ key: 'minPrice', label: `من ${price(f.minPrice)}` });
  if (f.maxPrice !== undefined) out.push({ key: 'maxPrice', label: `لحد ${price(f.maxPrice)}` });
  if (f.inStock) out.push({ key: 'inStock', label: 'المتوفر بس' });
  if (f.onSale) out.push({ key: 'onSale', label: 'عليه خصم' });
  if (f.storeType) out.push({ key: 'storeType', label: STORE_TYPES.find((t) => t.type === f.storeType)?.plural ?? f.storeType });
  return out;
}
