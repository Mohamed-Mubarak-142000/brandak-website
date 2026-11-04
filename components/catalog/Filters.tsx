import { X } from 'lucide-react';
import Link from 'next/link';

import { price } from '@/lib/format';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

import { hrefWith, type ProductFilters, type SearchParams } from './params';

const field =
  'h-11 w-full min-w-0 rounded-card border border-line-strong bg-surface px-3 text-ui placeholder:text-ink-3 transition-colors focus:border-brand focus:outline-none';
const option =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-card px-2 text-ui text-ink-2 transition-colors hover:bg-sunken has-[:checked]:font-bold has-[:checked]:text-ink';
const control = 'size-[18px] shrink-0 cursor-pointer accent-accent';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-4 first:pt-0 last:border-b-0">
      <legend className="float-start mb-2 w-full text-ui font-extrabold text-ink">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

/**
 * Product filters as a plain GET form, so they work before (or without) JavaScript. Rendered in the
 * sticky sidebar on desktop and inside the filters drawer on phones. `keep` carries params the form
 * doesn't show (the search query, the current sort).
 */
export function FilterForm({
  path,
  filters,
  storeTypes,
  keep = {},
  clearHref,
}: {
  path: string;
  filters: ProductFilters;
  storeTypes?: StoreType[];
  keep?: Record<string, string | undefined>;
  clearHref: string;
}) {
  const types = STORE_TYPES.filter((t) => !storeTypes?.length || storeTypes.includes(t.type));
  const active = activeFilters(filters).length > 0;

  return (
    <form action={path} method="get">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}

      {types.length > 1 ? (
        <Group title="نوع المتجر">
          <label className={option}>
            <input type="radio" name="storeType" value="" defaultChecked={!filters.storeType} className={control} />
            كل المتاجر
          </label>
          {types.map(({ type, plural, icon: Icon }) => (
            <label key={type} className={option}>
              <input type="radio" name="storeType" value={type} defaultChecked={filters.storeType === type} className={control} />
              <Icon aria-hidden className="size-4 text-ink-3" />
              {plural}
            </label>
          ))}
        </Group>
      ) : null}

      <Group title="السعر بالجنيه">
        <div className="flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-meta text-ink-3">من</span>
            <input type="number" name="minPrice" min={0} inputMode="numeric" placeholder="٠" defaultValue={filters.minPrice} className={field} />
          </label>
          <span aria-hidden className="mt-5 text-ink-3">
            –
          </span>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-meta text-ink-3">لحد</span>
            <input type="number" name="maxPrice" min={0} inputMode="numeric" placeholder="أي سعر" defaultValue={filters.maxPrice} className={field} />
          </label>
        </div>
      </Group>

      <Group title="إظهار">
        <label className={option}>
          <input type="checkbox" name="inStock" value="1" defaultChecked={filters.inStock} className={control} />
          المتوفر بس
        </label>
        <label className={option}>
          <input type="checkbox" name="onSale" value="1" defaultChecked={filters.onSale} className={control} />
          عليه خصم
        </label>
      </Group>

      <div className="mt-2 flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-accent px-5 text-ui font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          طبّق الفلاتر
        </button>
        {active ? (
          <Link href={clearHref} className="inline-flex min-h-11 items-center rounded-full px-4 text-ui font-bold text-ink-2 transition-colors hover:bg-sunken hover:text-ink">
            امسح
          </Link>
        ) : null}
      </div>
    </form>
  );
}

/** The filters in use as removable chips, plus "امسح الكل". Nothing when no filter is set. */
export function ActiveFilters({ path, searchParams, filters, clearHref }: { path: string; searchParams: SearchParams; filters: ProductFilters; clearHref: string }) {
  const active = activeFilters(filters);
  if (!active.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map((a) => (
        <Link
          key={a.key}
          href={hrefWith(path, searchParams, { [a.key]: undefined, page: undefined })}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-accent-soft ps-3 pe-2 text-meta font-bold text-accent transition-colors hover:border-accent"
          aria-label={`شيل فلتر ${a.label}`}
        >
          {a.label}
          <X aria-hidden className="size-3.5" />
        </Link>
      ))}
      <Link href={clearHref} className="inline-flex min-h-9 items-center px-2 text-meta font-bold text-ink-2 underline-offset-4 hover:text-ink hover:underline">
        امسح الكل
      </Link>
    </div>
  );
}

export function activeFilters(f: ProductFilters) {
  const out: { key: string; label: string }[] = [];
  if (f.storeType) out.push({ key: 'storeType', label: STORE_TYPES.find((t) => t.type === f.storeType)?.plural ?? f.storeType });
  if (f.minPrice !== undefined) out.push({ key: 'minPrice', label: `من ${price(f.minPrice)}` });
  if (f.maxPrice !== undefined) out.push({ key: 'maxPrice', label: `لحد ${price(f.maxPrice)}` });
  if (f.inStock) out.push({ key: 'inStock', label: 'المتوفر بس' });
  if (f.onSale) out.push({ key: 'onSale', label: 'عليه خصم' });
  return out;
}
