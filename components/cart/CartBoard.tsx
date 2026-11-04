'use client';

import { ArrowLeft, CircleAlert, Package, Trash2, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { shopError } from '@/components/checkout/errors';
import { EmptyState } from '@/components/EmptyState';
import { notifyCartChanged } from '@/components/header/AccountNav';
import { StoreLogo } from '@/components/StoreCard';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num, price } from '@/lib/format';
import type { CartView, LineIssue, PricedLine } from '@/lib/types';

import { QuantityStepper } from './QuantityStepper';

export interface StoreCartData {
  view: CartView;
  /** From the store's public page; null if it couldn't be read. */
  minOrderAmount: number | null;
  freeShippingThreshold: number | null;
}

const ISSUE: Record<LineIssue, string> = {
  UNAVAILABLE: 'المنتج ده مبقاش متاح. شيله عشان تكمّل.',
  OUT_OF_STOCK: 'المنتج ده خلص. شيله عشان تكمّل.',
  INSUFFICIENT_STOCK: 'الكمية المتاحة أقل من اللي طالبه.',
  BELOW_MIN_QTY: 'منتج جملة: زوّد الكمية.',
};

/** Every store's cart, one card each: each store ships its own order. */
export function CartBoard({ carts }: { carts: StoreCartData[] }) {
  const [emptied, setEmptied] = useState<Set<string>>(new Set());
  const left = carts.filter((c) => !emptied.has(c.view.brand.id));

  if (!left.length) {
    return (
      <EmptyState
        art="box"
        title="سلتك فاضية"
        body="اكتشف المعارض والمحلات والمخازن والبراندات، وضيف اللي يعجبك."
        action={
          <Link href="/stores" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover">
            ابدأ التسوق
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {left.length > 1 ? <p className="text-ui text-ink-2">عندك منتجات من {num(left.length)} متاجر. كل متجر طلبه لوحده وبيشحنه لوحده.</p> : null}
      {left.map((c) => (
        <StoreCart key={c.view.brand.id} data={c} onEmpty={() => setEmptied((s) => new Set(s).add(c.view.brand.id))} />
      ))}
      <p className="flex items-center gap-2 rounded-card bg-sunken px-4 py-3 text-ui text-ink-2">
        <Truck aria-hidden className="size-5 shrink-0 text-ink-3" />
        الدفع كاش عند الاستلام. كل متجر بيشحن طلبه لوحده، فممكن يوصلوا في أيام مختلفة.
      </p>
    </div>
  );
}

function StoreCart({ data, onEmpty }: { data: StoreCartData; onEmpty: () => void }) {
  const router = useRouter();
  const [view, setView] = useState(data.view);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const brand = view.brand;
  const subtotal = view.subtotal;
  const free = data.freeShippingThreshold;
  const toFree = free != null ? Math.max(0, free - subtotal) : null;
  const belowMin = data.minOrderAmount != null && subtotal < data.minOrderAmount;
  const blocked = view.hasIssues || !view.acceptingOrders || belowMin || !view.items.length;
  const pieces = view.items.reduce((n, i) => n + i.quantity, 0);

  const run = async (itemId: string, call: () => Promise<CartView>) => {
    setBusy(itemId);
    setErrors((x) => {
      const rest = { ...x };
      delete rest[itemId];
      return rest;
    });
    try {
      const next = await call();
      notifyCartChanged();
      if (!next?.items?.length) {
        onEmpty();
        router.refresh();
        return;
      }
      setView(next);
      router.refresh();
    } catch (e) {
      setErrors((x) => ({ ...x, [itemId]: shopError(e) }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby={`cart-${brand.id}`} className="overflow-hidden rounded-panel border border-line bg-surface">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
        <Link href={`/brand/${brand.slug}`} className="group flex min-h-11 min-w-0 flex-1 items-center gap-3">
          <StoreLogo store={{ name: brand.name, logoUrl: brand.logoUrl }} size={40} />
          <h2 id={`cart-${brand.id}`} className="truncate text-body font-extrabold group-hover:text-accent">
            {brand.name}
          </h2>
        </Link>
        <span className="shrink-0 text-meta text-ink-3">{num(pieces)} قطعة</span>
      </header>

      <ul className="divide-y divide-line">
        {view.items.map((line) => (
          <CartLine
            key={line.itemId}
            line={line}
            busy={busy === line.itemId}
            locked={busy !== null}
            error={errors[line.itemId]}
            onQty={(q) => run(line.itemId, () => api.patch<CartView>(`carts/${brand.id}/items/${line.itemId}`, { quantity: q }))}
            onRemove={() => run(line.itemId, () => api.delete<CartView>(`carts/${brand.id}/items/${line.itemId}`))}
          />
        ))}
      </ul>

      <div className="space-y-3 bg-sunken px-4 py-4 sm:px-5">
        {toFree != null && free ? <FreeShipping remaining={toFree} threshold={free} subtotal={subtotal} /> : null}
        {!view.acceptingOrders ? <Note tone="warning">المتجر مش بيستقبل طلبات دلوقتي.</Note> : null}
        {belowMin && data.minOrderAmount != null ? (
          <Note tone="warning">
            أقل طلب للمتجر ده {price(data.minOrderAmount)}. ضيف بـ {price(data.minOrderAmount - subtotal)} كمان.
          </Note>
        ) : null}
        {view.hasIssues ? <Note tone="danger">فيه منتجات محتاجة مراجعة قبل الطلب.</Note> : null}
        <div className="flex items-center justify-between gap-3">
          <span className="text-ui text-ink-2">المجموع</span>
          <strong className="text-section font-extrabold">{price(subtotal)}</strong>
        </div>
        {blocked ? (
          <span aria-disabled className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-line px-5 text-center font-bold text-ink-3">
            كمّل الطلب من {brand.name}
          </span>
        ) : (
          <Link
            href={`/checkout/${brand.id}`}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-center font-bold text-on-accent transition-colors hover:bg-accent-hover"
          >
            كمّل الطلب من {brand.name}
            <ArrowLeft aria-hidden className="size-5" />
          </Link>
        )}
        <p className="text-center text-meta text-ink-3">الشحن والخصومات بتتحسب في الخطوة الجاية.</p>
      </div>
    </section>
  );
}

function CartLine({
  line,
  busy,
  locked,
  error,
  onQty,
  onRemove,
}: {
  line: PricedLine;
  busy: boolean;
  locked: boolean;
  error?: string;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const opts = [line.size, line.color].filter(Boolean).join(' · ');
  const gone = line.issue === 'UNAVAILABLE' || line.issue === 'OUT_OF_STOCK';
  const wholesale = (line.minQty ?? 1) > 1;
  const max = Math.max(line.quantity, Math.min(Math.max(line.available, 1), wholesale ? 1000 : 20));

  return (
    <li className={cn('flex gap-3 px-4 py-4 sm:gap-4 sm:px-5', line.issue && 'bg-danger-soft/40', busy && 'opacity-60')}>
      <Link href={`/product/${line.productId}`} className="relative block size-20 shrink-0 overflow-hidden rounded-card bg-sunken sm:size-24" tabIndex={-1} aria-hidden>
        {line.imageUrl ? (
          <Image src={line.imageUrl} alt="" fill sizes="96px" className={cn('object-cover', gone && 'grayscale')} />
        ) : (
          <Package className="absolute inset-0 m-auto size-8 text-ink-3" />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <Link href={`/product/${line.productId}`} className="line-clamp-2 min-w-0 flex-1 text-ui font-semibold hover:text-accent">
            {line.title}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            disabled={locked}
            aria-label={`شيل ${line.title} من السلة`}
            className="-me-2 -mt-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-danger disabled:cursor-wait"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>
        {opts ? <p className="text-meta text-ink-3">{opts}</p> : null}
        <p className="text-meta text-ink-2">
          {price(line.unitPrice)} للقطعة
        </p>
        {line.issue ? (
          <p className="flex items-start gap-1.5 text-meta font-semibold text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {ISSUE[line.issue]}
              {line.issue === 'INSUFFICIENT_STOCK' ? ` المتاح ${num(line.available)}.` : ''}
              {line.issue === 'BELOW_MIN_QTY' && line.minQty ? ` أقل طلب ${num(line.minQty)} قطعة من كل الاختيارات مع بعض.` : ''}
            </span>
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-meta font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          {gone ? <span /> : <QuantityStepper size="sm" value={line.quantity} max={max} onChange={onQty} onRemove={onRemove} disabled={locked} label={`كمية ${line.title}`} />}
          <strong className="text-body font-extrabold">{price(line.lineTotal)}</strong>
        </div>
      </div>
    </li>
  );
}

function Note({ tone, children }: { tone: 'warning' | 'danger'; children: React.ReactNode }) {
  return (
    <p className={cn('flex items-start gap-2 rounded-card px-3 py-2.5 text-ui font-semibold', tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function FreeShipping({ remaining, threshold, subtotal }: { remaining: number; threshold: number; subtotal: number }) {
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="space-y-2">
      <p className={cn('flex items-center gap-2 text-ui font-semibold', remaining > 0 ? 'text-ink' : 'text-success')}>
        <Truck aria-hidden className={cn('size-4', remaining > 0 ? 'text-brand' : 'text-success')} />
        {remaining > 0 ? `ضيف بـ ${price(remaining)} والشحن يبقى مجاني` : 'الشحن عليك مجاني'}
      </p>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="الطريق للشحن المجاني" className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className={cn('h-full rounded-full transition-[width] duration-300', remaining > 0 ? 'bg-brand' : 'bg-success')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
