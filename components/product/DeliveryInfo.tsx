import { Banknote, Clock, MapPin, RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

import { num, plainText, price } from '@/lib/format';
import type { PublicBrand } from '@/lib/types';

export const days = (n: number) => (n === 1 ? 'يوم' : n === 2 ? 'يومين' : n <= 10 ? `${num(n)} أيام` : `${num(n)} يوم`);

type Shipping = NonNullable<PublicBrand['shipping']>;

function feeRange(s: Shipping) {
  const fees = [...(s.zones ?? []).map((z) => z.fee), ...(s.defaultFee !== null && s.defaultFee !== undefined ? [s.defaultFee] : [])].filter((f) => f >= 0);
  return fees.length ? { min: Math.min(...fees), max: Math.max(...fees) } : null;
}

/** One line each for delivery and returns, for the trust rows under the order button. */
export function deliverySummary(store: PublicBrand | null) {
  const s = store?.shipping;
  const range = s ? feeRange(s) : null;
  const zones = s?.zones?.length ?? 0;

  let delivery = 'توصيل لباب البيت';
  if (range) delivery = range.min === range.max ? (range.min === 0 ? 'توصيل مجاني' : `التوصيل ${price(range.min)}`) : `التوصيل من ${price(range.min)}`;
  if (zones) delivery += `، لـ ${num(zones)} محافظة`;

  let returns: string | null = null;
  if (s?.returnDays && s.returnDays > 0) returns = `ترجيع خلال ${days(s.returnDays)} من الاستلام`;
  else if (s?.returnDays === 0) returns = 'المتجر ده مش بيقبل ترجيع';

  return { delivery, returns, free: s?.freeShippingThreshold ? `مجاني للطلبات من ${price(s.freeShippingThreshold)}` : null };
}

/** Delivery and returns as the store set them up, plus cash on delivery (always on). */
export function DeliveryInfo({ store }: { store: PublicBrand }) {
  const s = store.shipping;
  if (!s) return null;
  const range = feeRange(s);

  const rows: { icon: LucideIcon; title: string; body?: string }[] = [];

  if (range) {
    rows.push({
      icon: Truck,
      title: range.min === range.max ? `التوصيل ${range.min === 0 ? 'مجاني' : price(range.min)}` : `التوصيل من ${price(range.min)} لـ ${price(range.max)}`,
      body:
        [
          range.min !== range.max ? 'حسب المحافظة، وبيظهرلك المبلغ بالظبط في التطبيق قبل ما تأكد.' : null,
          s.freeShippingThreshold ? `مجاني للطلبات من ${price(s.freeShippingThreshold)} من المتجر ده.` : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    });
  } else if (s.freeShippingThreshold) {
    rows.push({ icon: Truck, title: `توصيل مجاني للطلبات من ${price(s.freeShippingThreshold)}` });
  }

  if (s.processingDays > 0) rows.push({ icon: Clock, title: `بيجهّز الطلب في ${days(s.processingDays)}`, body: 'وبعدها بيتشحن لعنوانك.' });

  rows.push({ icon: Banknote, title: 'الدفع كاش عند الاستلام', body: s.minOrderAmount > 0 ? `أقل طلب من المتجر ده ${price(s.minOrderAmount)}.` : 'بتدفع لما الطلب يوصلك، مفيش دفع مقدّم.' });

  if (s.returnDays && s.returnDays > 0) {
    rows.push({ icon: RotateCcw, title: `ترجيع خلال ${days(s.returnDays)} من الاستلام`, body: s.returnPolicy ? plainText(s.returnPolicy) : undefined });
  } else if (s.returnDays === 0) {
    rows.push({ icon: RotateCcw, title: 'المتجر ده مش بيقبل ترجيع', body: s.returnPolicy ? plainText(s.returnPolicy) : undefined });
  } else if (s.returnPolicy) {
    rows.push({ icon: RotateCcw, title: 'سياسة الترجيع', body: plainText(s.returnPolicy) });
  }

  if (s.pickup?.enabled) {
    rows.push({ icon: MapPin, title: 'ينفع تستلم من المتجر', body: [s.pickup.address, s.pickup.hours].filter(Boolean).join('، ') || undefined });
  }

  if (s.shippingPolicy) rows.push({ icon: ShieldCheck, title: 'سياسة الشحن', body: plainText(s.shippingPolicy) });

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex gap-3 rounded-panel border border-line bg-surface p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-ui font-bold">{title}</p>
            {body ? <p className="mt-0.5 whitespace-pre-line text-meta text-ink-2 sm:text-ui">{body}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
