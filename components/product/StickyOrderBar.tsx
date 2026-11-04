'use client';

import { Loader2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { price } from '@/lib/format';
import type { ProductDetail } from '@/lib/types';

import { addToCart, usePurchase } from './purchase';

/**
 * Phones and tablets: the live price and "أضف للسلة" stay on screen while scrolling. With no size or
 * colour chosen yet, the button scrolls up to the options instead. It is sticky (not fixed) at the
 * end of <main>, so it parks above the footer instead of covering it.
 */
export function StickyOrderBar({ product, acceptsOrders = true }: { product: ProductDetail; acceptsOrders?: boolean }) {
  const router = useRouter();
  const p = usePurchase(product);
  const canBuy = acceptsOrders && !p.soldOut && product.variants.length > 0;
  const choice = [p.state.color, p.state.size].filter(Boolean).join(' · ');

  return (
    <div className="sticky bottom-0 z-30 mt-12 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(29_26_24/0.25)] lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body font-extrabold leading-tight">{price(canBuy ? p.total : p.unitPrice)}</p>
          {!canBuy ? (
            <p className="text-meta font-semibold text-danger">{acceptsOrders ? 'خلصان دلوقتي' : 'المتجر مش بيستقبل طلبات دلوقتي'}</p>
          ) : p.state.error ? (
            <p className="truncate text-meta font-semibold text-danger">{p.state.error}</p>
          ) : (
            <p className="truncate text-meta text-ink-3">{choice ? `${choice} · ${p.qty} ${product.unit || 'قطعة'}` : p.needsChoice ? 'اختار الأول' : `${p.qty} ${product.unit || 'قطعة'}`}</p>
          )}
        </div>
        {canBuy ? (
          <button
            type="button"
            onClick={() => addToCart(product, (href) => router.push(href))}
            disabled={p.state.busy}
            className="inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
          >
            {p.state.busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <ShoppingBag aria-hidden className="size-5" />}
            أضف للسلة
          </button>
        ) : null}
      </div>
    </div>
  );
}
