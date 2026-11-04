/**
 * Same rules as the API (`brandak backend/src/auth/auth.dto.ts`) with the app's Arabic messages
 * (`brandak app/src/lib/validation.ts`).
 */

export const EG_MOBILE = /^(?:\+?20|0)?1[0125]\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Arabic-Indic digits typed on an Arabic keyboard → Latin ones. */
export const latinDigits = (v: string) =>
  v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

export const cleanPhone = (v: string) => latinDigits(v).replace(/[\s-]/g, '');

/** "+201012345678" → "0101 234 5678". */
export function formatPhone(e164?: string | null) {
  if (!e164) return '—';
  const national = e164.replace(/^\+20/, '0');
  return national.length === 11 ? `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}` : national;
}

/** "+201012345678" → "01012345678" for editing. */
export const nationalPhone = (e164?: string | null) => (e164 ?? '').replace(/^\+20/, '0');

export function phoneError(v: string) {
  const p = cleanPhone(v.trim());
  if (!p) return 'اكتب رقم الموبايل';
  return EG_MOBILE.test(p) ? null : 'رقم موبايل مصري مش صحيح (مثال: 01012345678)';
}

export function emailError(v: string) {
  const e = v.trim();
  if (!e) return 'اكتب الإيميل';
  return EMAIL.test(e) && e.length <= 254 ? null : 'الإيميل ده مش صحيح';
}

/** The backend rule: 8–128 characters with a letter and a digit. */
export const PASSWORD_RULES = [
  { key: 'length', label: '8 حروف على الأقل', test: (v: string) => v.length >= 8 && v.length <= 128 },
  { key: 'letter', label: 'حرف إنجليزي واحد على الأقل', test: (v: string) => /[A-Za-z]/.test(v) },
  { key: 'digit', label: 'رقم واحد على الأقل', test: (v: string) => /\d/.test(v) },
] as const;

export function passwordError(v: string) {
  if (!v) return 'اكتب كلمة السر';
  if (v.length > 128) return 'كلمة السر طويلة أوي';
  if (v.length < 8) return 'كلمة السر 8 حروف على الأقل';
  if (!/[A-Za-z]/.test(v)) return 'لازم يكون فيها حرف إنجليزي واحد على الأقل';
  if (!/\d/.test(v)) return 'لازم يكون فيها رقم واحد على الأقل';
  return null;
}

/** 0–4 for the strength bar (same scoring as the app). */
export function passwordStrength(v: string) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
  return score;
}
