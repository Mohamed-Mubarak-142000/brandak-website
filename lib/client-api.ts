'use client';

/**
 * Browser calls to the API through the site's proxy (`/api/v1/...`), which adds the visitor's
 * token. On a 401 it refreshes the session once — shared by every request waiting on it, because
 * the API rotates refresh tokens — then retries.
 */

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

/** Plain-language messages for the codes people actually hit. */
const MESSAGES: Record<string, string> = {
  NETWORK: 'مفيش اتصال دلوقتي. اتأكد من النت وجرّب تاني.',
  UNAUTHORIZED: 'لازم تسجّل دخول الأول.',
  TOO_MANY_REQUESTS: 'محاولات كتير ورا بعض. استنى دقيقة وجرّب تاني.',
  VALIDATION_ERROR: 'فيه بيانات ناقصة أو مش مظبوطة.',
  ACCOUNT_EXISTS: 'فيه حساب بالإيميل أو الرقم ده. سجّل دخول بدل ما تعمل حساب جديد.',
  INVALID_PHONE: 'اكتب رقم موبايل مصري صحيح.',
  OTP_INVALID: 'الكود غلط أو انتهى. اطلب كود جديد.',
  ACCOUNT_SUSPENDED: 'الحساب ده موقوف. كلّم الدعم.',
  SELLER_ACCOUNT: 'حساب المتجر مينفعش يشتري. استخدم حساب عميل.',
  OUT_OF_STOCK: 'المنتج ده خلص.',
  INSUFFICIENT_STOCK: 'الكمية المطلوبة مش متاحة.',
};

export const errorMessage = (e: unknown, fallback = 'حصلت مشكلة. جرّب تاني.') =>
  e instanceof ApiError ? (MESSAGES[e.code] ?? (e.status === 401 ? MESSAGES.UNAUTHORIZED : fallback)) : fallback;

let refreshing: Promise<boolean> | null = null;
function refreshOnce() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

interface Envelope<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: { code: string; message: string; details?: unknown };
}

async function call<T>(method: string, path: string, body?: unknown, opts: { idempotencyKey?: string; raw?: BodyInit } = {}, retried = false): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (opts.idempotencyKey) headers['idempotency-key'] = opts.idempotencyKey;
  let res: Response;
  try {
    res = await fetch(`/api/v1/${path.replace(/^\//, '')}`, {
      method,
      headers,
      body: opts.raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError('NETWORK', MESSAGES.NETWORK, 0);
  }
  if (res.status === 401 && !retried && (await refreshOnce())) return call<T>(method, path, body, opts, true);
  if (res.status === 204) return { data: null as T };
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !json?.success) {
    const err = json?.error;
    throw new ApiError(err?.code ?? (res.status === 401 ? 'UNAUTHORIZED' : 'ERROR'), err?.message ?? res.statusText, res.status, err?.details);
  }
  return { data: json.data as T, meta: json.meta };
}

export const api = {
  get: <T>(path: string) => call<T>('GET', path).then((r) => r.data),
  page: <T>(path: string) => call<T[]>('GET', path),
  post: <T>(path: string, body?: unknown, opts?: { idempotencyKey?: string }) => call<T>('POST', path, body ?? {}, opts).then((r) => r.data),
  patch: <T>(path: string, body: unknown) => call<T>('PATCH', path, body).then((r) => r.data),
  put: <T>(path: string, body: unknown) => call<T>('PUT', path, body).then((r) => r.data),
  delete: <T>(path: string) => call<T>('DELETE', path).then((r) => r.data),
  /** multipart (uploads): pass FormData; the browser sets the boundary. */
  upload: <T>(path: string, form: FormData) => call<T>('POST', path, undefined, { raw: form }).then((r) => r.data),
};

/** Sign-in helpers (cookies are set by the site's own routes). */
export const auth = {
  async login(identifier: string, password: string) {
    return postAuth('/api/auth/login', { identifier, password });
  },
  async register(body: { name: string; email: string; phone: string; password: string }) {
    return postAuth('/api/auth/register', body);
  },
  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  },
};

async function postAuth(url: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new ApiError('NETWORK', MESSAGES.NETWORK, 0);
  }
  const json = (await res.json().catch(() => null)) as Envelope<{ user: unknown }> | null;
  if (!res.ok || !json?.success) {
    const code = json?.error?.code ?? (res.status === 401 ? 'INVALID_CREDENTIALS' : 'ERROR');
    throw new ApiError(code, json?.error?.message ?? '', res.status, json?.error?.details);
  }
  return json.data;
}

/** True when the signed-in flag cookie is present (no request needed). */
export const looksSignedIn = () => typeof document !== 'undefined' && /(?:^|;\s*)fat_in=1/.test(document.cookie);
