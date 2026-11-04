import { NextResponse } from 'next/server';

import { clearTokens, readTokens } from '@/lib/auth-cookies';
import { backend, clientIpOf } from '@/lib/backend';

/** Ends the session on the API too, then forgets the cookies. */
export async function POST(req: Request) {
  const { access } = await readTokens();
  if (access) await backend('auth/logout', { method: 'POST', token: access, clientIp: clientIpOf(req.headers) });
  await clearTokens();
  return NextResponse.json({ success: true });
}
