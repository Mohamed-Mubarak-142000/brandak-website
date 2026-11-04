import 'server-only';

import type {
  Campaign,
  Category,
  CommissionTerms,
  Governorate,
  PageMeta,
  ProductCard,
  ProductDetail,
  PublicBrand,
  Review,
  StoreType,
} from './types';

/**
 * Read-only client for the public API. Every call runs on the server (Server Components), so the
 * browser never talks to the API and the backend's CORS list needs no change.
 * Responses are cached for 10 minutes (ISR); a failing API degrades to empty lists, and a missing
 * item to `null`, so pages render instead of crashing.
 */

const BASE = (process.env.API_BASE_URL ?? 'https://brandak-backend.vercel.app/api/v1').replace(/\/$/, '');
const REVALIDATE = 600;

type Query = Record<string, string | number | boolean | undefined | null>;

interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: Partial<PageMeta> & Record<string, unknown>;
}

function url(path: string, query?: Query) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return `${BASE}/${path}${s ? `?${s}` : ''}`;
}

async function get<T>(path: string, query?: Query): Promise<Envelope<T> | null> {
  try {
    const res = await fetch(url(path, query), { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    return (await res.json()) as Envelope<T>;
  } catch {
    return null;
  }
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

async function list<T>(path: string, query?: Query): Promise<Page<T>> {
  const env = await get<T[]>(path, query);
  const items = env?.data ?? [];
  return {
    items,
    page: env?.meta?.page ?? 1,
    limit: env?.meta?.limit ?? items.length,
    total: env?.meta?.total ?? items.length,
  };
}

async function one<T>(path: string, query?: Query): Promise<T | null> {
  return (await get<T>(path, query))?.data ?? null;
}

// ---------- Stores ----------

export interface BrandsQuery {
  storeType?: StoreType;
  q?: string;
  categoryId?: string;
  sort?: 'newest' | 'rating' | 'name';
  page?: number;
  limit?: number;
}

export const getBrands = (query: BrandsQuery = {}) => list<PublicBrand>('brands', { ...query });

export const getBrand = (slug: string) => one<PublicBrand>(`brands/${encodeURIComponent(slug)}`);

// ---------- Products ----------

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'discount';

export interface ProductsQuery {
  q?: string;
  categoryId?: string;
  brandId?: string;
  storeType?: StoreType;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  campaignId?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export const getProducts = (query: ProductsQuery = {}) => list<ProductCard>('products', { ...query });

export const getBrandProducts = (slug: string, query: Pick<ProductsQuery, 'sort' | 'page' | 'limit'> = {}) =>
  list<ProductCard>(`brands/${encodeURIComponent(slug)}/products`, { ...query });

export const getFeaturedProducts = async () => (await get<ProductCard[]>('products/featured'))?.data ?? [];

export const getProduct = (id: string) => one<ProductDetail>(`products/${encodeURIComponent(id)}`);

/** Reviews plus the star histogram the API returns in `meta.stars`. */
export async function getReviews(productId: string, limit = 3) {
  const env = await get<Review[]>(`products/${encodeURIComponent(productId)}/reviews`, { limit });
  return {
    items: env?.data ?? [],
    total: env?.meta?.total ?? 0,
    stars: (env?.meta?.stars as Record<'1' | '2' | '3' | '4' | '5', number> | undefined) ?? null,
  };
}

// ---------- Catalog ----------

export const getCategories = async () => (await get<Category[]>('categories'))?.data ?? [];

export const getGovernorates = async () => (await get<Governorate[]>('governorates'))?.data ?? [];

export const getCampaigns = async () => (await get<Campaign[]>('campaigns'))?.data ?? [];

export const getCampaign = (slug: string) => one<Campaign>(`campaigns/${encodeURIComponent(slug)}`);

// ---------- Platform ----------

/** Falls back to the published terms (5%, 14 days, 2000 ج.م) if the API is down. */
export async function getTerms(): Promise<CommissionTerms> {
  return (await one<CommissionTerms>('platform/terms')) ?? { commissionRate: 0.05, settlementDays: 14, maxUnpaidBalance: 2000 };
}
