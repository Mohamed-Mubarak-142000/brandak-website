'use client';

import { ApiError, errorMessage } from '@/lib/client-api';

/** Codes from the account endpoints that lib/client-api.ts doesn't word yet. */
const MORE: Record<string, string> = {
  WRONG_PASSWORD: 'كلمة السر غلط.',
  SAME_PASSWORD: 'اختار كلمة سر مختلفة عن الحالية.',
  OTP_COOLDOWN: 'استنى شوية قبل ما تطلب كود جديد.',
  ALREADY_VERIFIED: 'إيميلك متأكد بالفعل.',
  NOTHING_TO_CONFIRM: 'مفيش طلبات مستنية تأكيد دلوقتي.',
  ACTIVE_ORDERS: 'عندك طلبات لسه شغالة. استنى لما توصل (أو ألغيها) وبعدين احذف الحساب.',
  STORE_OWNER: 'الحساب ده عليه متجر. كلّم دعم فاترينة يقفلوا المتجر الأول وبعدين تقدر تحذف الحساب.',
  INVALID_TRANSITION: 'مينفعش تلغي الطلب ده دلوقتي. غالباً المتجر أكّده خلاص.',
  INVALID_STATE: 'حالة الطلب اتغيرت. حدّث الصفحة وجرّب تاني.',
  CONCURRENT_UPDATE: 'الطلب اتعدّل حالاً. حدّث الصفحة وجرّب تاني.',
  ADDRESS_LIMIT: 'وصلت للحد الأقصى للعناوين. امسح عنوان قديم الأول.',
  NOT_FOUND: 'مش لاقيين ده. يمكن اتمسح.',
};

export const accountError = (e: unknown, fallback?: string) => (e instanceof ApiError && MORE[e.code] ? MORE[e.code] : errorMessage(e, fallback));

/** Field names the API flagged as invalid (VALIDATION_ERROR details). */
export function invalidFields(e: unknown): string[] {
  if (!(e instanceof ApiError) || !Array.isArray(e.details)) return [];
  return (e.details as { field?: string }[]).map((d) => d.field).filter((f): f is string => !!f);
}
