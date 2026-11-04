import 'server-only';

/**
 * Server-side calls to the API on behalf of a visitor (signed in or not). Everything that needs the
 * visitor's tokens goes through here — the browser never sees them.
 *
 * The site runs on a Cloudflare Worker, so the API would see the worker's IP for every visitor and
 * its per-IP limits (e.g. 5 sign-in attempts a minute) would be shared by everyone. With
 * WEB_PROXY_SECRET set on both sides, the visitor's real IP travels in a header the API trusts.
 */

export const API_BASE = (process.env.API_BASE_URL ?? 'https://brandak-backend.vercel.app/api/v1').replace(/\/$/, '');

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface BackendResult<T = unknown> {
  status: number;
  ok: boolean;
  data: T | null;
  meta?: Record<string, unknown>;
  error?: ApiErrorBody;
}

export function forwardHeaders(clientIp?: string | null, token?: string | null): Record<string, string> {
  const h: Record<string, string> = { accept: 'application/json' };
  if (token) h.authorization = `Bearer ${token}`;
  const secret = process.env.WEB_PROXY_SECRET;
  if (secret && clientIp) {
    h['x-fatrina-proxy-key'] = secret;
    h['x-fatrina-client-ip'] = clientIp;
  }
  return h;
}

/** The visitor's IP as Cloudflare saw it. */
export const clientIpOf = (headers: Headers) => headers.get('cf-connecting-ip') ?? headers.get('x-real-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

export async function backend<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; token?: string | null; clientIp?: string | null; search?: string } = {},
): Promise<BackendResult<T>> {
  const headers = forwardHeaders(init.clientIp, init.token);
  if (init.body !== undefined) headers['content-type'] = 'application/json';
  try {
    const res = await fetch(`${API_BASE}/${path.replace(/^\//, '')}${init.search ?? ''}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });
    if (res.status === 204) return { status: 204, ok: true, data: null };
    const json = (await res.json().catch(() => null)) as { data?: T; meta?: Record<string, unknown>; error?: ApiErrorBody } | null;
    return { status: res.status, ok: res.ok, data: json?.data ?? null, meta: json?.meta, error: json?.error };
  } catch {
    return { status: 503, ok: false, data: null, error: { code: 'NETWORK', message: 'Service unavailable' } };
  }
}
