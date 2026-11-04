'use client';

import { latinDigits } from '@/components/auth/validation';
import { ApiError, api, errorMessage } from '@/lib/client-api';
import type { Category, StoreType } from '@/lib/types';

import type { CategoryTemplate, UploadResult } from './types';

/** "١٢٠" / "120" → 120; blank or not a number → undefined. */
export const num = (s: string) => {
  const t = latinDigits(s).trim().replace(/[٫,]/g, '.');
  const n = Number(t);
  return t !== '' && Number.isFinite(n) ? n : undefined;
};

export const uniq = (xs: (string | null | undefined)[]) => [...new Set(xs.map((x) => x?.trim() ?? '').filter(Boolean))];

/** Until a category is picked (or while its template loads): free sizes and colours, by the piece. */
export const fallbackTemplate = (storeType?: StoreType): CategoryTemplate => ({
  size: { label: 'المقاس', values: [], allowCustom: true },
  color: { label: 'اللون', allowCustom: true },
  specs: [],
  units: ['قطعة'],
  sizeGuide: null,
  wholesale: storeType === 'WAREHOUSE' ? 'required' : 'optional',
});

/** One size × colour combination's stock and optional own price/SKU. */
export interface Cell {
  id?: string;
  stock: string;
  price: string;
  sku: string;
}
export type Cells = Record<string, Cell>;
export const cellKey = (size: string, color: string) => `${size}|${color}`;
export const emptyCell = (): Cell => ({ stock: '', price: '', sku: '' });

/** Every combination picked; a product with neither sizes nor colours has one. */
export const combos = (sizes: string[], colors: string[]) =>
  (sizes.length ? sizes : ['']).flatMap((size) => (colors.length ? colors : ['']).map((color) => ({ size, color, key: cellKey(size, color) })));

/** Helpers over the flat category list (section › category › sub-category; products go on leaves). */
export function categoryTree(all: Category[]) {
  const live = all.filter((c) => c.isActive);
  const byId = new Map(live.map((c) => [c._id, c]));
  const children = new Map<string | null, Category[]>();
  for (const c of live) {
    const key = c.parentId && byId.has(c.parentId) ? c.parentId : null;
    children.set(key, [...(children.get(key) ?? []), c]);
  }
  for (const list of children.values()) list.sort((a, b) => a.sortOrder - b.sortOrder || a.nameAr.localeCompare(b.nameAr, 'ar'));
  const ancestors = (id: string): Category[] => {
    const out: Category[] = [];
    let c = byId.get(id);
    while (c?.parentId && out.length < 5) {
      const p = byId.get(c.parentId);
      if (!p) break;
      out.unshift(p);
      c = p;
    }
    return out;
  };
  const isLeaf = (id: string) => !children.get(id)?.length;
  const path = (id: string) => [...ancestors(id), byId.get(id)].filter(Boolean).map((c) => c!.nameAr).join(' › ');
  const descendants = (id: string): Category[] => (children.get(id) ?? []).flatMap((c) => [c, ...descendants(c._id)]);
  const leavesUnder = (roots: string[]) => {
    const pool = roots.length ? roots.flatMap((r) => (byId.has(r) ? [byId.get(r)!, ...descendants(r)] : [])) : live;
    return [...new Map(pool.filter((c) => isLeaf(c._id)).map((c) => [c._id, c])).values()];
  };
  return { byId, isLeaf, path, leavesUnder };
}

/** Product, upload and AI codes the API returns, in the app's words. */
const PRODUCT_ERRORS: Record<string, string> = {
  FILE_REQUIRED: 'اختار صورة الأول.',
  FILE_TYPE_NOT_ALLOWED: 'نوع الملف مش مدعوم. استخدم صورة JPG أو PNG أو WEBP.',
  PAYLOAD_TOO_LARGE: 'الصورة أكبر من 4 ميجا.',
  INVALID_FILES: 'فيه صور مش موجودة. ارفعها تاني.',
  INVALID_WHOLESALE: 'كل ما الكمية تزيد السعر لازم يقل، وكله أقل من السعر العادي.',
  AI_UNAVAILABLE: 'الخدمة دي مش متاحة دلوقتي.',
  AI_DAILY_LIMIT: 'خلصت محاولات النهارده، جرّب بكرة.',
  AI_FAILED: 'حصلت مشكلة في قراءة الصورة، جرّب تاني.',
  AI_BUSY: 'خدمة الذكاء الاصطناعي عليها ضغط دلوقتي، جرّب كمان دقيقة.',
  AI_IMAGE: 'مقدرناش نفتح الصورة، ارفعها تاني.',
  AI_UNREADABLE: 'مش واضح إن الصورة لمنتج. صوّر المنتج لوحده على خلفية بسيطة.',
  IMAGE_LIMIT: 'باقتك مش بتسمح بعدد الصور ده للمنتج. شيل صور.',
  PLAN_REQUIRED: 'اختار باقة لمتجرك الأول.',
  PLAN_LIMIT_REACHED: 'وصلت لأقصى عدد منتجات منشورة في باقتك.',
  SUBSCRIPTION_REQUIRED: 'محتاج اشتراك فعّال عشان تنشر منتجات.',
  PRODUCT_LIMIT: 'وصلت للحد الأقصى للمنتجات.',
  VARIANT_REQUIRED: 'ضيف مقاس أو لون واحد على الأقل.',
  INVALID_CATEGORY: 'القسم مش صحيح.',
  CATEGORY_NOT_LEAF: 'اختار قسم فرعي أدق للمنتج.',
  CATEGORY_NOT_IN_STORE: 'القسم ده مش من أقسام متجرك. ضيفه من إعدادات المتجر الأول.',
  CATEGORY_NOT_FOR_STORE_TYPE: 'القسم ده مش متاح لنوع نشاطك.',
  SPEC_REQUIRED: 'كمّل المواصفات المطلوبة (اللي مش مكتوب جنبها اختياري).',
  INVALID_SPEC: 'فيه مواصفة قيمتها مش صحيحة.',
  INVALID_SIZE: 'فيه مقاس مش من المقاسات المتاحة للقسم ده.',
  SIZE_NOT_ALLOWED: 'القسم ده مالوش مقاسات، شيل المقاسات.',
  COLOR_NOT_ALLOWED: 'القسم ده مالوش ألوان، شيل الألوان.',
  INVALID_UNIT: 'وحدة البيع مش متاحة للقسم ده.',
  WHOLESALE_REQUIRED: 'المخازن لازم تحدد أسعار الجملة قبل النشر.',
  INVALID_COMPARE_PRICE: 'السعر قبل الخصم لازم يكون أكبر من السعر.',
  INVALID_STOCK_CHANGE: 'المخزون مينفعش يبقى بالسالب.',
  INVALID_DATES: 'تاريخ نهاية العرض لازم يكون بعد بدايته.',
  NOT_FOUND: 'المنتج ده مش موجود. يمكن اتمسح.',
  PRODUCT_NOT_FOUND: 'المنتج ده مش موجود. يمكن اتمسح.',
};

export const productError = (e: unknown, fallback?: string) => (e instanceof ApiError && PRODUCT_ERRORS[e.code] ? PRODUCT_ERRORS[e.code] : errorMessage(e, fallback));

const MAX_SIDE = 1600;

/**
 * Phone photos can be 3–12 MB; the API takes ≤ 4 MB. Resize to 1600px and re-encode as JPEG in
 * the browser; falls back to the original file if the browser can't decode it.
 */
async function compress(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000 && /jpe?g|webp/.test(file.type)) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.8));
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Two-step upload: POST /uploads (PRODUCT_IMAGE), then send the id in imageFileIds. */
export async function uploadProductImage(file: File) {
  const blob = await compress(file);
  const form = new FormData();
  form.append('file', blob, blob === file ? file.name : `${file.name.replace(/\.\w+$/, '') || 'photo'}.jpg`);
  form.append('purpose', 'PRODUCT_IMAGE');
  return api.upload<UploadResult>('uploads', form);
}
