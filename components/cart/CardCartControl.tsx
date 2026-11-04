'use client';

import { Loader2, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useDismiss } from '@/components/header/useDismiss';
import { shopError } from '@/components/checkout/errors';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { ProductCard, ProductDetail, Variant } from '@/lib/types';

import { cartLines, useCartLines } from './cartLines';
import { QuantityStepper } from './QuantityStepper';

const buyable = (v: Variant) => v.inStock && v.available > 0;
const variantLabel = (v: Variant) => [v.size, v.color].filter(Boolean).join(' · ') || 'المتاح';

/**
 * "أضف للسلة" on a product card. Once the product is in the cart it becomes − n +, and − at one
 * turns into a bin. Products with sizes/colours open a small picker on the card itself; the
 * variants are fetched only when someone asks to add.
 */
export function CardCartControl({ product }: { product: ProductCard }) {
  const { status, lines } = useCartLines(product.id);
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choices, setChoices] = useState<Variant[] | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useDismiss(wrap);
  const minQty = product.wholesale?.minQty && product.wholesale.minQty > 1 ? product.wholesale.minQty : 1;

  if (status === 'seller') return null;

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await job();
    } catch (e) {
      setError(shopError(e, 'معرفناش نعدّل السلة. جرّب تاني.'));
    } finally {
      setBusy(false);
    }
  };

  const add = (variant: Variant) =>
    run(async () => {
      await cartLines.add(product.id, product.brand.id, variant.id, Math.min(minQty, Math.max(1, variant.available)));
      setPickerOpen(false);
    });

  const start = () => {
    if (status === 'out') return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    void run(async () => {
      const detail = choices ? null : await api.get<ProductDetail>(`products/${product.id}`);
      const options = (choices ?? detail?.variants ?? []).filter(buyable);
      if (!choices) setChoices(options);
      if (!options.length) return setError('المنتج ده خلص دلوقتي.');
      if (options.length === 1) {
        await cartLines.add(product.id, product.brand.id, options[0].id, Math.min(minQty, Math.max(1, options[0].available)));
      } else {
        setPickerOpen(true);
      }
    });
  };

  // Already in the cart: one line → − n +; several sizes/colours → a link to the cart.
  if (lines.length === 1) {
    const line = lines[0];
    const max = Math.max(line.quantity, line.available || line.quantity);
    return (
      <div className="flex items-center justify-between gap-2">
        <QuantityStepper
          size="sm"
          value={line.quantity}
          min={1}
          max={max}
          disabled={busy}
          label={`الكمية في السلة: ${product.title}`}
          onChange={(n) => run(() => cartLines.setQuantity(line, n))}
          onRemove={() => run(() => cartLines.remove(line))}
        />
        {busy ? <Loader2 aria-hidden className="size-4 animate-spin text-ink-3" /> : null}
        {error ? <p role="alert" className="text-meta text-danger">{error}</p> : null}
      </div>
    );
  }
  if (lines.length > 1) {
    const total = lines.reduce((n, l) => n + l.quantity, 0);
    return (
      <Link href="/cart" className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-success-soft px-3 text-ui font-bold text-success">
        <ShoppingBag aria-hidden className="size-4" />
        في السلة ({total})
      </Link>
    );
  }

  if (!product.inStock) {
    return <p className="flex min-h-10 items-center justify-center rounded-full bg-sunken text-ui font-semibold text-ink-3">خلصان دلوقتي</p>;
  }

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={start}
        disabled={busy || status === 'loading'}
        aria-expanded={pickerOpen}
        className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-accent px-3 text-ui font-bold text-accent transition-colors hover:bg-accent hover:text-on-accent disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ShoppingBag aria-hidden className="size-4" />}
        أضف للسلة
      </button>
      {error ? <p role="alert" className="mt-1 text-meta text-danger">{error}</p> : null}

      {pickerOpen && choices && choices.length > 1 ? (
        <div role="dialog" aria-label={`اختار من ${product.title}`} className="absolute inset-x-0 bottom-full z-20 mb-2 rounded-panel border border-line bg-surface p-3 shadow-pop">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-meta font-bold">اختار المقاس أو اللون</p>
            <button type="button" onClick={() => setPickerOpen(false)} aria-label="اقفل" className="-m-2 grid size-9 cursor-pointer place-items-center rounded-full hover:bg-sunken">
              <X aria-hidden className="size-4" />
            </button>
          </div>
          <ul className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
            {choices.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => add(v)}
                  className={cn('min-h-9 cursor-pointer rounded-full border border-line-strong px-3 text-meta font-semibold transition-colors hover:border-brand hover:text-accent', busy && 'opacity-60')}
                >
                  {variantLabel(v)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
