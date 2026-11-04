import { readTokens } from '@/lib/auth-cookies';
import { API_BASE, clientIpOf, forwardHeaders } from '@/lib/backend';

/**
 * The browser's door to the API: forwards the request with the visitor's token (from the httpOnly
 * cookie) and real IP, and passes the API's answer back untouched. A 401 is returned as is —
 * lib/client-api.ts refreshes once and retries. Sign-in routes have their own handlers.
 */
const BLOCKED = /^auth\/(login|register|refresh|logout)$/;

async function forward(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.map(encodeURIComponent).join('/');
  if (BLOCKED.test(path)) return Response.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, { status: 404 });

  const { access } = await readTokens();
  const headers = forwardHeaders(clientIpOf(req.headers), access);
  const type = req.headers.get('content-type');
  if (type) headers['content-type'] = type;
  const idem = req.headers.get('idempotency-key');
  if (idem) headers['idempotency-key'] = idem;

  const hasBody = !['GET', 'HEAD'].includes(req.method);
  try {
    const res = await fetch(`${API_BASE}/${path}${new URL(req.url).search}`, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: 'no-store',
    });
    return new Response(res.status === 204 ? null : await res.arrayBuffer(), {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'application/json', 'cache-control': 'no-store' },
    });
  } catch {
    return Response.json({ success: false, error: { code: 'NETWORK', message: 'Service unavailable' } }, { status: 503 });
  }
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
