import type { MetadataRoute } from 'next';

import { getBrands, getCampaigns, getCategories, getProducts } from '@/lib/api';
import { SITE_URL } from '@/lib/links';
import { STORE_TYPES } from '@/lib/store-types';

export const revalidate = 3600;

const PAGE = 100;
const MAX_PRODUCTS = 5000;
const MAX_STORES = 5000;

/**
 * Walks a paged API list. The API helpers never throw (a failure is an empty page), so a down API
 * just ends the walk early and the sitemap still lists the static pages.
 */
async function collect<T>(fetchPage: (page: number) => Promise<{ items: T[]; total: number }>, cap: number) {
  const all: T[] = [];
  for (let page = 1; all.length < cap; page++) {
    const { items, total } = await fetchPage(page);
    all.push(...items);
    if (items.length < PAGE || all.length >= total) break;
  }
  return all.slice(0, cap);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const at = (path: string) => `${SITE_URL}${path}`;

  const fixed: MetadataRoute.Sitemap = [
    { url: at('/'), changeFrequency: 'daily', priority: 1 },
    { url: at('/stores'), changeFrequency: 'daily', priority: 0.9 },
    ...STORE_TYPES.map((t) => ({ url: at(t.path), changeFrequency: 'daily' as const, priority: 0.9 })),
    { url: at('/offers'), changeFrequency: 'daily', priority: 0.8 },
    { url: at('/sell'), changeFrequency: 'monthly', priority: 0.8 },
    { url: at('/download'), changeFrequency: 'monthly', priority: 0.6 },
    { url: at('/about'), changeFrequency: 'yearly', priority: 0.5 },
    { url: at('/faq'), changeFrequency: 'monthly', priority: 0.5 },
    { url: at('/contact'), changeFrequency: 'yearly', priority: 0.4 },
    { url: at('/terms'), changeFrequency: 'yearly', priority: 0.2 },
    { url: at('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: at('/delete-account'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const [stores, products, categories, campaigns] = await Promise.all([
      collect((page) => getBrands({ page, limit: PAGE }), MAX_STORES),
      collect((page) => getProducts({ page, limit: PAGE }), MAX_PRODUCTS),
      getCategories(),
      getCampaigns(),
    ]);

    return [
      ...fixed,
      ...campaigns.map((c) => ({ url: at(`/campaigns/${encodeURIComponent(c.slug)}`), changeFrequency: 'daily' as const, priority: 0.6 })),
      ...categories
        .filter((c) => c.isActive !== false && (c.level ?? (c.parentId ? 1 : 0)) <= 1)
        .map((c) => ({ url: at(`/category/${c._id}`), changeFrequency: 'weekly' as const, priority: 0.7 })),
      ...stores.map((s) => ({ url: at(`/brand/${encodeURIComponent(s.slug)}`), changeFrequency: 'weekly' as const, priority: 0.7 })),
      ...products.map((p) => ({ url: at(`/product/${p.id}`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ];
  } catch {
    return fixed;
  }
}
