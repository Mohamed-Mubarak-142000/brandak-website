'use client';

import { CircleAlert, Loader2, ShoppingBag, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { QuantityStepper } from '@/components/cart/QuantityStepper';
import { cn } from '@/lib/cn';
import { num, price } from '@/lib/format';
import type { ProductDetail } from '@/lib/types';

import { AddedToast } from './AddedToast';
import { ProductOptions } from './ProductOptions';
import { addToCart, loadInCart, setPurchase, usePurchase } from './purchase';

/** The live price at the top of the card: follows the chosen variant and wholesale tier. */
export function LivePrice({ product, className }: { product: ProductDetail; className?: string }) {
  const p = usePurchase(product);
  return <span className={className}>{price(p.unitPrice)}</span>;
}

/**
 * Choose, set the quantity, add. `details` (the store-type part: wholesale table, size guide) goes
 * between the options and the quantity, where it informs the choice.
 */
export function AddToCart({ product, acceptsOrders, details }: { product: ProductDetail; acceptsOrders: boolean; details?: React.ReactNode }) {
  const router = useRouter();
  const p = usePurchase(product);
  const s = p.state;
  const unit = product.unit || 'قطعة';

  useEffect(() => {
    void loadInCart(product);
  }, [product]);

  const go = (href: string) => router.push(href);
  const canBuy = acceptsOrders && !p.soldOut && product.variants.length > 0;
  const reached = s.inCart + p.qty >= p.minQty;

  return (
    <div className="space-y-5">
      <ProductOptions product={product} />

      {details}

      {canBuy ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-ui font-bold">
                الكمية
              </span>
              <QuantityStepper value={p.qty} max={p.max} onChange={(n) => setPurchase(product.id, { qty: n, error: null })} label={`الكمية (${unit})`} />
            </div>
            <p className="text-ui text-ink-2">
              الإجمالي <strong className="text-body font-extrabold text-ink">{price(p.total)}</strong>
            </p>
          </div>
          {p.selected && p.selected.available <= 5 ? <p className="text-meta font-semibold text-warning">فاضل {num(p.selected.available)} بس من الاختيار ده</p> : null}
          {p.tiered ? <p className="text-meta font-semibold text-success">سعر الجملة: {price(p.unitPrice)} لل{unit} بدل {price(p.regular)}</p> : null}
          {product.wholesale && p.minQty > 1 ? (
            <p className={cn('text-meta font-semibold', reached ? 'text-success' : 'text-warning')}>
              {reached
                ? `وصلت لأقل طلب (${num(p.minQty)} ${unit})`
                : `أقل طلب ${num(p.minQty)} ${unit} من كل الاختيارات مع بعض${s.inCart ? `، في سلتك ${num(s.inCart)}` : ''}. ضيف ${num(p.minQty - s.inCart - p.qty)} كمان.`}
            </p>
          ) : null}

          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addToCart(product, go)}
              disabled={s.busy}
              className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-surface px-5 text-body font-bold text-accent transition-colors hover:bg-accent-soft disabled:cursor-wait disabled:opacity-70"
            >
              {s.busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <ShoppingBag aria-hidden className="size-5" />}
              أضف للسلة
            </button>
            <button
              type="button"
              onClick={() => addToCart(product, go, true)}
              disabled={s.busy}
              className="inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-body font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
            >
              <Zap aria-hidden className="size-5" />
              اشتري دلوقتي
            </button>
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-card bg-sunken px-4 py-3 text-ui font-semibold text-ink-2">
          <CircleAlert aria-hidden className="size-5 shrink-0 text-ink-3" />
          {!acceptsOrders ? 'المتجر مش بيستقبل طلبات دلوقتي. جرّب بعدين.' : 'المنتج ده خلصان دلوقتي.'}
        </p>
      )}

      {s.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-card bg-danger-soft px-4 py-3 text-ui font-semibold text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {s.error}
        </p>
      ) : null}

      <AddedToast productId={product.id} />
    </div>
  );
}
