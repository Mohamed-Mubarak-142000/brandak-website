import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { readTokens } from './auth-cookies';
import { backend, clientIpOf, type BackendResult } from './backend';
import type { Me } from './types';

export type Session = { user: Me; token: string } | null;

/**
 * The signed-in user for this request (once per request). An expired access token with a refresh
 * token still present reports `stale`, so a page can bounce through /api/auth/refresh, which can
 * set cookies — Server Components can't.
 */
export const getSession = cache(async (): Promise<{ session: Session; stale: boolean }> => {
  const { access, refresh } = await readTokens();
  if (!access) return { session: null, stale: !!refresh };
  const res = await backend<Me>('users/me', { token: access, clientIp: clientIpOf(await headers()) });
  if (res.ok && res.data) return { session: { user: res.data, token: access }, stale: false };
  return { session: null, stale: res.status === 401 && !!refresh };
});

/**
 * For pages that need an account. Sends visitors who aren't signed in to /login, and refreshes an
 * expired session on the way back to `next`.
 */
export async function requireSession(next: string): Promise<NonNullable<Session>> {
  const { session, stale } = await getSession();
  if (session) return session;
  const back = encodeURIComponent(next);
  redirect(stale ? `/api/auth/refresh?next=${back}` : `/login?next=${back}`);
}

/** For store-owner pages: no store yet → the apply page. */
export async function requireSeller(next: string) {
  const session = await requireSession(next);
  if (!session.user.brand) redirect('/seller/apply');
  return session as NonNullable<Session> & { user: Me & { brand: NonNullable<Me['brand']> } };
}

/** An authenticated API call from a Server Component. */
export async function authed<T>(path: string, token: string, init: { method?: string; body?: unknown; search?: string } = {}): Promise<BackendResult<T>> {
  return backend<T>(path, { ...init, token, clientIp: clientIpOf(await headers()) });
}

/** Keeps `next` on this site (no open redirects). */
export const safeNext = (next: string | null | undefined, fallback = '/account') =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/') ? next : fallback;
