import 'server-only';

import { getMyBrand } from '@/components/seller/data';
import { authed } from '@/lib/session';
import type { Category } from '@/lib/types';

import type { MyBrandLite } from './types';

/** What the product form needs from the server: the store (type, sections) and the category list. */
export async function loadFormData(token: string): Promise<{ brand: MyBrandLite; categories: Category[] } | null> {
  const brand = await getMyBrand();
  if (!brand) return null;
  const cats = await authed<Category[]>('categories', token, { search: `?storeType=${brand.storeType}` });
  if (!cats.ok || !cats.data) return null;
  return { brand: { id: brand.id, name: brand.name, slug: brand.slug, storeType: brand.storeType, categoryIds: brand.categoryIds ?? [] }, categories: cats.data };
}
