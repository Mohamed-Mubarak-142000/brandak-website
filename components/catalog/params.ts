import type { ProductSort, ProductsQuery } from '@/lib/api';
import type { StoreType } from '@/lib/types';

/** Raw Next.js searchParams after awaiting. */
export type SearchParams = Record<string, string | string[] | undefined>;

export const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'popular', label: 'الأكثر طلبًا' },
  { value: 'price_asc', label: 'السعر: الأقل الأول' },
  { value: 'price_desc', label: 'السعر: الأعلى الأول' },
  { value: 'rating', label: 'الأعلى تقييمًا' },
  { value: 'discount', label: 'أكبر خصم' },
];

const STORE_TYPE_VALUES: StoreType[] = ['BRAND', 'SHOWROOM', 'WAREHOUSE', 'SHOP'];

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const positive = (v: string | undefined) => {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function pageParam(sp: SearchParams) {
  const n = Math.floor(Number(one(sp.page)));
  return Number.isFinite(n) && n > 1 ? n : 1;
}

export function sortParam(sp: SearchParams, fallback: ProductSort = 'newest'): ProductSort {
  const s = one(sp.sort);
  return SORTS.some((o) => o.value === s) ? (s as ProductSort) : fallback;
}

export interface ProductFilters {
  sort: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  storeType?: StoreType;
}

/** The filters the category page understands, read leniently from the URL (bad values are dropped). */
export function readFilters(sp: SearchParams, allowedTypes?: StoreType[]): ProductFilters {
  const type = one(sp.storeType) as StoreType | undefined;
  const allowed = allowedTypes?.length ? allowedTypes : STORE_TYPE_VALUES;
  return {
    sort: sortParam(sp),
    minPrice: positive(one(sp.minPrice)),
    maxPrice: positive(one(sp.maxPrice)),
    inStock: one(sp.inStock) === '1' ? true : undefined,
    onSale: one(sp.onSale) === '1' ? true : undefined,
    storeType: type && allowed.includes(type) ? type : undefined,
  };
}

export const filtersQuery = (f: ProductFilters): ProductsQuery => ({ ...f });

/** Builds `path?…` from the current params with some keys replaced (undefined removes a key). */
export function hrefWith(path: string, sp: SearchParams, changes: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (val !== undefined) qs.set(k, val);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v === undefined || v === '') qs.delete(k);
    else qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

export const totalPages = (total: number, limit: number) => Math.max(1, Math.ceil(total / Math.max(1, limit)));
