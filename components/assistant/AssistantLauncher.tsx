import 'server-only';

import { getBrand } from '@/lib/api';
import { API_BASE } from '@/lib/backend';

import { AssistantChat } from './AssistantChat';
import { whatsappHref } from './whatsapp';

interface AssistantInfo {
  enabled: boolean;
  name: string;
  greeting: string;
  suggestions: string[];
}

const OFF: AssistantInfo = { enabled: false, name: '', greeting: '', suggestions: [] };

/** Public assistant settings (CDN-cached 60 s on the API too). Any failure = no assistant. */
async function getAssistant(slug: string): Promise<AssistantInfo> {
  try {
    const res = await fetch(`${API_BASE}/brands/${encodeURIComponent(slug)}/assistant`, {
      headers: { accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return OFF;
    const json = (await res.json()) as { data?: Partial<AssistantInfo> } | null;
    const d = json?.data;
    if (!d?.enabled || !d.name) return OFF;
    return {
      enabled: true,
      name: d.name,
      greeting: d.greeting || `أهلاً بيك! أنا ${d.name}، اسألني عن أي منتج.`,
      suggestions: Array.isArray(d.suggestions) ? d.suggestions.filter((s): s is string => typeof s === 'string' && !!s.trim()).slice(0, 4) : [],
    };
  } catch {
    return OFF;
  }
}

/**
 * The store's AI assistant: a floating button on the store and product pages. Renders nothing when
 * the store hasn't switched it on (or the API can't be reached).
 */
export async function AssistantLauncher({ slug, productId }: { slug: string; productId?: string }) {
  const [info, store] = await Promise.all([getAssistant(slug), getBrand(slug).catch(() => null)]);
  if (!info.enabled) return null;

  return (
    <AssistantChat
      slug={slug}
      name={info.name}
      greeting={info.greeting}
      suggestions={info.suggestions}
      productId={productId}
      whatsapp={whatsappHref(store?.contact?.whatsapp)}
      store={{ name: store?.name ?? info.name, logoUrl: store?.logoUrl ?? null }}
      aboveOrderBar={!!productId}
    />
  );
}
