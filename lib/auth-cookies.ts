import 'server-only';

import { cookies } from 'next/headers';

import type { AuthResult } from './types';

/**
 * Tokens live in httpOnly cookies so page scripts can never read them. `fat_in` is a plain flag
 * (no secret in it) that lets client components know someone is signed in without a request.
 */
export const ACCESS = 'fat_at';
export const REFRESH = 'fat_rt';
export const SIGNED_IN = 'fat_in';

const base = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
const DAY = 60 * 60 * 24;

export async function readTokens() {
  const jar = await cookies();
  return { access: jar.get(ACCESS)?.value ?? null, refresh: jar.get(REFRESH)?.value ?? null };
}

/** Only callable from route handlers and server actions (Server Components can't set cookies). */
export async function saveTokens(t: Pick<AuthResult, 'accessToken' | 'refreshToken'>) {
  const jar = await cookies();
  jar.set(ACCESS, t.accessToken, { ...base, maxAge: 7 * DAY });
  jar.set(REFRESH, t.refreshToken, { ...base, maxAge: 60 * DAY });
  jar.set(SIGNED_IN, '1', { ...base, httpOnly: false, maxAge: 60 * DAY });
}

export async function clearTokens() {
  const jar = await cookies();
  for (const name of [ACCESS, REFRESH, SIGNED_IN]) jar.delete(name);
}
