import { NextResponse } from 'next/server';

import { saveTokens } from '@/lib/auth-cookies';
import { backend, clientIpOf } from '@/lib/backend';
import type { AuthResult } from '@/lib/types';

/** Signs in and keeps the tokens in httpOnly cookies; the page only gets the user back. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { identifier?: string; password?: string } | null;
  const res = await backend<AuthResult>('auth/login', {
    method: 'POST',
    body: { identifier: body?.identifier ?? '', password: body?.password ?? '' },
    clientIp: clientIpOf(req.headers),
  });
  if (!res.ok || !res.data) return NextResponse.json({ success: false, error: res.error }, { status: res.status });
  await saveTokens(res.data);
  return NextResponse.json({ success: true, data: { user: res.data.user } });
}
