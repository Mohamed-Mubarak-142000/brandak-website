'use client';

import { accountError } from '@/components/auth/errors';
import { ApiError } from '@/lib/client-api';

/** Codes from the store-owner endpoints, in the app's wording. */
const MORE: Record<string, string> = {
  BRAND_EXISTS: 'عندك متجر بالفعل. افتح لوحة متجرك.',
  BRAND_SUSPENDED: 'المتجر موقوف مؤقتاً ومينفعش يتعدّل. كلّم دعم فاترينة.',
  DUPLICATE_ZONE: 'كل محافظة تتكتب مرة واحدة بس.',
  PICKUP_ADDRESS_REQUIRED: 'اكتب عنوان الاستلام من المتجر.',
  INVALID_TRANSITION: 'مينفعش تنقل الطلب للحالة دي دلوقتي. حدّث الصفحة.',
  INVALID_STATE: 'الحالة اتغيرت. حدّث الصفحة وجرّب تاني.',
  CONCURRENT_UPDATE: 'الطلب اتعدّل حالاً. حدّث الصفحة وجرّب تاني.',
  REASON_REQUIRED: 'اكتب سبب الإلغاء.',
  FILE_TYPE_NOT_ALLOWED: 'الصورة لازم تكون JPG أو PNG أو WEBP.',
  FILE_TOO_LARGE: 'الصورة أكبر من 4 ميجا. صغّرها وجرّب تاني.',
  PAYLOAD_TOO_LARGE: 'الصورة أكبر من 4 ميجا. صغّرها وجرّب تاني.',
  FILE_REQUIRED: 'اختار صورة الأول.',
  INVALID_FILES: 'الصورة دي مش متاحة. ارفعها تاني.',
  INVALID_CATEGORY: 'قسم من الأقسام مش متاح. اختار تاني.',
  CATEGORY_NOT_FOR_STORE_TYPE: 'القسم ده مش مناسب لنوع نشاطك.',
  FORBIDDEN: 'مش مسموحلك تعمل ده.',
};

export const sellerError = (e: unknown, fallback?: string) => (e instanceof ApiError && MORE[e.code] ? MORE[e.code] : accountError(e, fallback));
