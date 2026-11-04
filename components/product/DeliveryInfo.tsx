import { Banknote, Clock, MapPin, RotateCcw, Truck } from 'lucide-react';

import { num, plainText, price } from '@/lib/format';
import type { PublicBrand } from '@/lib/types';

const days = (n: number) => (n === 1 ? 'يوم' : n === 2 ? 'يومين' : n <= 10 ? `${num(n)} أيام` : `${num(n)} يوم`);

/** Delivery and returns as the store set them up, plus cash on delivery (always on). */
export function DeliveryInfo({ store }: { store: PublicBrand }) {
  const s = store.shipping;
  if (!s) return null;
  const fees = [...(s.zones ?? []).map((z) => z.fee), ...(s.defaultFee !== null && s.defaultFee !== undefined ? [s.defaultFee] : [])].filter((f) => f >= 0);
  const min = fees.length ? Math.min(...fees) : null;
  const max = fees.length ? Math.max(...fees) : null;

  const rows: { icon: typeof Truck; title: string; body?: string }[] = [];

  if (min !== null && max !== null) {
    rows.push({
      icon: Truck,
      title: min === max ? `التوصيل ${min === 0 ? 'مجاني' : price(min)}` : `التوصيل من ${price(min)} لـ ${price(max)}`,
      body: [
        min !== max ? 'حسب المحافظة، وبيظهرلك المبلغ بالظبط في التطبيق قبل ما تأكد.' : null,
        s.freeShippingThreshold ? `مجاني للطلبات من ${price(s.freeShippingThreshold)} من المتجر ده.` : null,
      ]
        .filter(Boolean)
        .join(' '),
    });
  } else if (s.freeShippingThreshold) {
    rows.push({ icon: Truck, title: `توصيل مجاني للطلبات من ${price(s.freeShippingThreshold)}` });
  }

  if (s.processingDays > 0) rows.push({ icon: Clock, title: `بيجهّز الطلب في ${days(s.processingDays)}`, body: 'وبعدها بيتشحن لعنوانك.' });

  rows.push({ icon: Banknote, title: 'الدفع كاش عند الاستلام', body: s.minOrderAmount > 0 ? `أقل طلب من المتجر ده ${price(s.minOrderAmount)}.` : undefined });

  if (s.returnDays && s.returnDays > 0) {
    rows.push({ icon: RotateCcw, title: `ترجيع خلال ${days(s.returnDays)} من الاستلام`, body: s.returnPolicy ? plainText(s.returnPolicy) : undefined });
  } else if (s.returnDays === 0) {
    rows.push({ icon: RotateCcw, title: 'المتجر ده مش بيقبل ترجيع', body: s.returnPolicy ? plainText(s.returnPolicy) : undefined });
  }

  if (s.pickup?.enabled) {
    rows.push({ icon: MapPin, title: 'ينفع تستلم من المتجر', body: [s.pickup.address, s.pickup.hours].filter(Boolean).join('، ') || undefined });
  }

  return (
    <section aria-labelledby="delivery-title">
      <h2 id="delivery-title" className="text-section font-extrabold">
        التوصيل والترجيع
      </h2>
      <ul className="mt-3 divide-y divide-line rounded-panel border border-line bg-surface">
        {rows.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3 px-4 py-3">
            <Icon aria-hidden className="mt-1 size-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-ui font-bold">{title}</p>
              {body ? <p className="mt-0.5 whitespace-pre-line text-meta text-ink-2">{body}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
