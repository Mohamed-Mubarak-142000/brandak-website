import { NextResponse } from 'next/server';

import { saveTokens } from '@/lib/auth-cookies';
import { backend, clientIpOf } from '@/lib/backend';
import type { AuthResult } from '@/lib/types';

/** Creates the account and signs in; the page then asks for the email code. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, string> | null;
  const res = await backend<AuthResult>('auth/register', {
    method: 'POST',
    body: { name: body?.name ?? '', email: body?.email ?? '', phone: body?.phone ?? '', password: body?.password ?? '' },
    clientIp: clientIpOf(req.headers),
  });
  if (!res.ok || !res.data) return NextResponse.json({ success: false, error: res.error }, { status: res.status });
  await saveTokens(res.data);
  return NextResponse.json({ success: true, data: { user: res.data.user } }, { status: 201 });
}
