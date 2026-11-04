'use client';

import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useDismiss } from '@/components/header/useDismiss';
import { shopError } from '@/components/checkout/errors';
import { api } from '@/lib/client-api';
import type { ProductCard, ProductDetail, Variant } from '@/lib/types';

import { cartLines, useCartLines } from './cartLines';
import { QuantityStepper } from './QuantityStepper';
import { VariantPicker } from './VariantPicker';

const buyable = (v: Variant) => v.inStock && v.available > 0;

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
  const [openCount, setOpenCount] = useState(0);
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
        setOpenCount((n) => n + 1);
        setPickerOpen(true);
      }
    });
  };

  // Already in the cart: one line → − n +; several sizes/colours → a link to the cart.
  if (lines.length === 1) {
    const line = lines[0];
    const max = Math.max(line.quantity, line.available || line.quantity);
    return (
      <div className="relative flex flex-col gap-1">
        <QuantityStepper
          size="sm"
          block
          value={line.quantity}
          min={1}
          max={max}
          disabled={busy}
          label={`الكمية في السلة: ${product.title}`}
          onChange={(n) => run(() => cartLines.setQuantity(line, n))}
          onRemove={() => run(() => cartLines.remove(line))}
        />
        {busy ? <Loader2 aria-hidden className="pointer-events-none absolute top-3 start-[calc(50%+1.25rem)] size-4 animate-spin text-ink-3" /> : null}
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
        <VariantPicker
          key={openCount}
          title={product.title}
          variants={choices}
          busy={busy}
          onAdd={add}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
