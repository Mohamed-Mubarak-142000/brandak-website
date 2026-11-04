import { AlertCircle, Clock, MapPin, PackageCheck, RotateCcw, Truck } from 'lucide-react';

import { governorateName, plainText, price } from '@/lib/format';
import type { Governorate, PublicBrand } from '@/lib/types';

import { days } from './words';

const VISIBLE_ZONES = 8;

function Row({ icon: Icon, title, children }: { icon: typeof Truck; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden className="mt-1 size-5 shrink-0 text-brand" />
      <div className="min-w-0 flex-1">
        <h3 className="text-ui font-bold">{title}</h3>
        <div className="mt-0.5 text-ui text-ink-2">{children}</div>
      </div>
    </div>
  );
}

const fee = (n: number) => (n === 0 ? 'مجاني' : price(n));

function ZoneList({ zones, governorates }: { zones: PublicBrand['shipping']['zones']; governorates: Governorate[] }) {
  const sorted = [...zones].sort((a, b) => a.fee - b.fee);
  const item = (z: (typeof zones)[number]) => (
    <li key={z.governorate} className="flex justify-between gap-3 border-b border-line py-1.5 last:border-0">
      <span>{governorateName(z.governorate, governorates)}</span>
      <span className="font-semibold text-ink">{fee(z.fee)}</span>
    </li>
  );
  return (
    <>
      <ul className="mt-2">{sorted.slice(0, VISIBLE_ZONES).map(item)}</ul>
      {sorted.length > VISIBLE_ZONES ? (
        <details className="group">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center font-bold text-accent [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">باقي المحافظات ({sorted.length - VISIBLE_ZONES})</span>
            <span className="hidden group-open:inline">أقل</span>
          </summary>
          <ul>{sorted.slice(VISIBLE_ZONES).map(item)}</ul>
        </details>
      ) : null}
    </>
  );
}

/** Delivery, returns and pickup — what a shopper checks before ordering. */
export function StoreInfo({ store, governorates }: { store: PublicBrand; governorates: Governorate[] }) {
  const s = store.shipping;
  if (!s) return null;
  const zones = s.zones ?? [];
  const returnDays = s.returnDays;
  const pickup = s.pickup?.enabled ? s.pickup : null;
  const shippingPolicy = plainText(s.shippingPolicy ?? '');
  const returnPolicy = plainText(s.returnPolicy ?? '');

  return (
    <section aria-labelledby="store-info" className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <h2 id="store-info" className="text-section font-extrabold">
        التوصيل والاسترجاع
      </h2>

      {!s.acceptsOrders ? (
        <p className="mt-4 flex items-start gap-2 rounded-card bg-warning-soft p-3 text-ui font-semibold text-warning">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          المتجر مش بيستقبل طلبات دلوقتي. تقدر تتابعه من التطبيق ويوصلك لما يرجع.
        </p>
      ) : null}

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <Row icon={Truck} title="مصاريف الشحن">
          {zones.length ? (
            <>
              <p>{s.defaultFee != null ? 'حسب المحافظة:' : 'بيوصّل للمحافظات دي بس:'}</p>
              <ZoneList zones={zones} governorates={governorates} />
              {s.defaultFee != null ? <p className="mt-2">باقي المحافظات: <span className="font-semibold text-ink">{fee(s.defaultFee)}</span></p> : null}
            </>
          ) : s.defaultFee != null ? (
            <p>
              لكل المحافظات: <span className="font-semibold text-ink">{fee(s.defaultFee)}</span>
            </p>
          ) : (
            <p>مصاريف الشحن بتظهر في التطبيق لما تكتب عنوانك.</p>
          )}
          {s.freeShippingThreshold ? <p className="mt-2 font-semibold text-success">الشحن مجاني للطلبات من {price(s.freeShippingThreshold)}</p> : null}
        </Row>

        <div className="space-y-6">
          <Row icon={Clock} title="تجهيز الطلب">
            {s.processingDays > 0 ? `المتجر بيجهّز الطلب في ${days(s.processingDays)} قبل ما يتشحن.` : 'المتجر بيجهّز الطلب في نفس اليوم.'}
          </Row>

          <Row icon={RotateCcw} title="الاسترجاع">
            {returnDays === 0 ? 'مفيش استرجاع في المتجر ده.' : returnDays ? `تقدر تطلب استرجاع خلال ${days(returnDays)} من الاستلام.` : 'شروط الاسترجاع مكتوبة في التطبيق.'}
            {returnPolicy ? (
              <details className="mt-1">
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-accent">سياسة الاسترجاع</summary>
                <p className="whitespace-pre-line">{returnPolicy}</p>
              </details>
            ) : null}
          </Row>

          {s.minOrderAmount > 0 ? (
            <Row icon={PackageCheck} title="أقل طلب">
              أقل قيمة للطلب {price(s.minOrderAmount)}.
            </Row>
          ) : null}

          {pickup ? (
            <Row icon={MapPin} title="استلام من المتجر">
              {pickup.address ? (
                <p>
                  {pickup.address}
                  {pickup.governorate ? `، ${governorateName(pickup.governorate, governorates)}` : ''}
                </p>
              ) : (
                <p>متاح تستلم طلبك بنفسك.</p>
              )}
              {pickup.hours ? <p>المواعيد: {pickup.hours}</p> : null}
              {pickup.mapUrl ? (
                <a href={pickup.mapUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                  افتح المكان على الخريطة
                </a>
              ) : null}
            </Row>
          ) : null}
        </div>
      </div>

      {shippingPolicy ? (
        <details className="mt-6 border-t border-line pt-2 text-ui text-ink-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-ink">سياسة الشحن</summary>
          <p className="whitespace-pre-line">{shippingPolicy}</p>
        </details>
      ) : null}
    </section>
  );
}
