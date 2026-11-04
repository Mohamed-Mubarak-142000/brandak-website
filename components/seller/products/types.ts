/**
 * Store-owner product shapes, copied from `brandak app/src/api/types.ts` (BrandProduct,
 * CategoryTemplate, SpecDef, ProductDraft). Defined here because lib/seller-types.ts doesn't carry
 * them; move them there if another area needs them.
 */
import type { StoreType } from '@/lib/types';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type SpecValue = string | number | boolean;

export interface Wholesale {
  minQty: number;
  tiers: { minQty: number; price: number }[];
  pack?: { unit: string; qty: number } | null;
}

export interface BrandProduct {
  _id: string;
  wholesale?: Wholesale | null;
  categoryId: string;
  title: string;
  description: string;
  images: { fileId: string; url: string; color?: string | null }[];
  price: number;
  compareAtPrice: number | null;
  sale?: { percent: number; startsAt: string; endsAt: string; campaignId: string | null } | null;
  variants: { _id: string; sku?: string; size?: string; color?: string; price: number | null; stock: number }[];
  unit?: string;
  specs?: { key: string; value: SpecValue }[];
  status: ProductStatus;
  tags: string[];
  totalStock: number;
  soldCount: number;
  ratingAvg: number;
  ratingCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** A field a category asks for on its products (brand, warranty, material...). */
export interface SpecDef {
  key: string;
  labelAr: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  unit?: string;
  required?: boolean;
  filterable?: boolean;
}

/** What a product in a category asks for, as the store's type sees it. */
export interface CategoryTemplate {
  size: { label: string; preset?: string; values: string[]; allowCustom: boolean } | null;
  color: { label: string; allowCustom: boolean } | null;
  specs: SpecDef[];
  units: string[];
  sizeGuide: string | null;
  wholesale: 'optional' | 'required';
}

export interface ProductDraft {
  title: string;
  description: string;
  categoryId: string | null;
  colors: string[];
  sizes: string[];
  tags: string[];
  suggestedPrice?: number | null;
}

export interface AiStatus {
  enabled: boolean;
  remaining: number;
  dailyLimit: number;
}

export interface UploadResult {
  id: string;
  url: string | null;
  mime: string;
  size: number;
}

/** The part of `brands/me` these pages use. */
export interface MyBrandLite {
  id: string;
  name: string;
  slug: string;
  storeType: StoreType;
  categoryIds: string[];
}

export const STATUS_AR: Record<ProductStatus, string> = { ACTIVE: 'منشور', DRAFT: 'مسودة', ARCHIVED: 'مؤرشف' };
