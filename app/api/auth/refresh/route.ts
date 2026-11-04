import { NextResponse } from 'next/server';

import { clearTokens, readTokens, saveTokens } from '@/lib/auth-cookies';
import { backend, clientIpOf } from '@/lib/backend';
import { safeNext } from '@/lib/session';

/**
 * Swaps the refresh token for a new pair. The API rotates refresh tokens, so callers must not run
 * two refreshes at once — lib/client-api.ts shares one in-flight refresh across requests.
 */
async function rotate(req: Request) {
  const { refresh } = await readTokens();
  if (!refresh) return false;
  const res = await backend<{ accessToken: string; refreshToken: string }>('auth/refresh', {
    method: 'POST',
    body: { refreshToken: refresh },
    clientIp: clientIpOf(req.headers),
  });
  if (!res.ok || !res.data) {
    await clearTokens();
    return false;
  }
  await saveTokens(res.data);
  return true;
}

/** From the browser (client-api). */
export async function POST(req: Request) {
  const ok = await rotate(req);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 401 });
}

/** From a server page that found an expired session: refresh, then go back (or to /login). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'));
  const ok = await rotate(req);
  return NextResponse.redirect(new URL(ok ? next : `/login?next=${encodeURIComponent(next)}`, url.origin));
}
