'use client';

import { ApiError, errorMessage } from '@/lib/client-api';

/** Cart and checkout codes on top of the shared ones in lib/client-api. */
const SHOP: Record<string, string> = {
  BRAND_NOT_ACCEPTING_ORDERS: 'المتجر ده مش بيستقبل طلبات دلوقتي.',
  QUANTITY_LIMIT: 'وصلت لأكتر كمية ينفع تطلبها من المنتج ده.',
  CART_FULL: 'سلة المتجر ده مليانة. كمّل الطلب الأول أو شيل حاجة.',
  CART_EMPTY: 'سلة المتجر ده فاضية.',
  CART_HAS_ISSUES: 'فيه منتجات في السلة محتاجة مراجعة قبل الطلب.',
  NOT_FOUND: 'المنتج ده مبقاش متاح.',
  NOT_DELIVERABLE: 'المتجر مش بيوصّل للمحافظة دي. اختار عنوان تاني.',
  BELOW_MIN_ORDER: 'الطلب أقل من الحد الأدنى للمتجر ده.',
  ADDRESS_REQUIRED: 'اختار عنوان التوصيل.',
  PICKUP_NOT_AVAILABLE: 'المتجر ده مش بيوفّر الاستلام منه.',
  ORDER_NOT_ALLOWED: 'المتجر ده مش هيقدر ياخد طلبك.',
  COUPON_INVALID: 'الكود ده مش صحيح.',
  COUPON_EXPIRED: 'الكود ده انتهى.',
  COUPON_NOT_STARTED: 'الكود ده لسه مبدأش.',
  COUPON_MIN_SUBTOTAL: 'الطلب أقل من الحد المطلوب للكود ده.',
  COUPON_USED_UP: 'الكود ده خلص.',
  COUPON_ALREADY_USED: 'انت استخدمت الكود ده قبل كده.',
  POINTS_CHANGED: 'رصيد نقاطك اتغير. راجع الإجمالي وأكّد تاني.',
  PRICE_CHANGED: 'الأسعار أو الشحن اتغيرت. راجع الإجمالي الجديد وأكّد تاني.',
  NOTHING_TO_CONFIRM: 'مفيش طلب مستني تأكيد.',
  IDEMPOTENCY_KEY_REQUIRED: 'حصلت مشكلة. حدّث الصفحة وجرّب تاني.',
};

export const shopError = (e: unknown, fallback?: string) =>
  e instanceof ApiError && SHOP[e.code] ? SHOP[e.code] : errorMessage(e, fallback);

export const isCode = (e: unknown, ...codes: string[]) => e instanceof ApiError && codes.includes(e.code);

/** "١٢٣" → "123": Egyptian keyboards type Arabic-Indic digits. */
export const latinDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

export const loginHref = (next: string) => `/login?next=${encodeURIComponent(next)}`;
