'use client';

import { ApiError, errorMessage } from '@/lib/client-api';

/** Codes from the assistant and copilot endpoints. */
const AI_ERRORS: Record<string, string> = {
  ASSISTANT_DISABLED: 'المساعد مقفول أو المتجر مش ظاهر للعملاء دلوقتي. شغّله من الإعدادات فوق واحفظ.',
  AI_BUSY: 'الذكاء الاصطناعي عليه ضغط دلوقتي. جرّب كمان دقيقة.',
  AI_UNAVAILABLE: 'الخدمة دي مش متاحة دلوقتي. جرّب بعد شوية.',
  COPILOT_DAILY_LIMIT: 'خلصت رسايل النهارده لمساعدك الذكي. يرجع بكرة الصبح.',
  CONVERSATION_NOT_FOUND: 'المحادثة دي مش موجودة.',
  NO_BRAND: 'الحساب ده مالوش متجر.',
};

export function aiError(e: unknown, fallback?: string) {
  if (e instanceof ApiError) {
    if (e.code === 'ASSISTANT_DAILY_LIMIT') {
      const reason = Array.isArray(e.details) ? (e.details[0] as { reason?: string } | undefined)?.reason : undefined;
      return reason === 'visitor' ? 'وصلت لأقصى عدد رسايل للتجربة النهارده.' : 'المتجر استهلك ردود المساعد بتاعة النهارده. بيرجع بكرة.';
    }
    if (AI_ERRORS[e.code]) return AI_ERRORS[e.code];
  }
  return errorMessage(e, fallback);
}

/** Worth offering "جرّب تاني" (busy model / network), not a hard stop. */
export const retryable = (e: unknown) => e instanceof ApiError && (e.code === 'AI_BUSY' || e.code === 'AI_UNAVAILABLE' || e.code === 'NETWORK' || e.code === 'TOO_MANY_REQUESTS' || e.status >= 500);
