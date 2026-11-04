import { ChevronRight, Coins, ExternalLink, Gift, MapPin, MessageCircle, Package, Phone, Smartphone, Store, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { addressLine } from '@/components/account/AddressCard';
import { CancelOrder, ConfirmOrderBox } from '@/components/account/OrderActions';
import { canCancel, StatusChip } from '@/components/account/orderStatus';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { LoadError, Panel } from '@/components/account/PageTitle';
import { formatPhone } from '@/components/auth/validation';
import { OpenInApp } from '@/components/OpenInApp';
import { date, num, price } from '@/lib/format';
import { appPath } from '@/lib/links';
import { authed, requireSession } from '@/lib/session';
import type { OrderDetail } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: 'تفاصيل الطلب',
  robots: { index: false, follow: false },
};

const contactBtn = 'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold hover:border-brand hover:text-accent';

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const path = `/account/orders/${encodeURIComponent(id)}`;
  const { user, token } = await requireSession(path);
  const res = await authed<OrderDetail>(`orders/me/${encodeURIComponent(id)}`, token);
  if (res.status === 404 || res.status === 400) notFound();
  const o = res.data;

  const back = (
    <Link href="/account/orders" className="mb-4 inline-flex min-h-11 items-center gap-1 text-ui font-bold text-ink-2 hover:text-accent">
      <ChevronRight aria-hidden className="size-4" />
      كل الطلبات
    </Link>
  );
  if (!res.ok || !o) {
    return (
      <>
        {back}
        <LoadError what="الطلب" retryHref={path} />
      </>
    );
  }

  const pickup = o.fulfillment === 'PICKUP' || !o.address;
  const phone = o.brand.phone;

  return (
    <div className="flex flex-col gap-5">
      <div>
        {back}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page font-extrabold">
            طلب <bdi>#{o.orderNumber}</bdi>
          </h1>
          <StatusChip status={o.status} className="text-ui" />
        </div>
        <p className="mt-1 text-ui text-ink-2">
          من{' '}
          <Link href={`/brand/${o.brand.slug}`} className="font-bold text-ink hover:text-accent">
            {o.brand.name}
          </Link>{' '}
          · اتطلب {date(o.createdAt)} · {num(o.itemsCount)} قطعة
        </p>
      </div>

      {o.status === 'AWAITING_CONFIRMATION' ? <ConfirmOrderBox email={user.email} /> : null}

      {o.shipment ? (
        <div className="flex flex-wrap items-center gap-3 rounded-panel border border-line bg-surface p-4">
          <Truck aria-hidden className="size-6 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">مع {o.shipment.carrier}</p>
            <p className="text-meta text-ink-2">
              رقم الشحنة <bdi className="select-all font-semibold">{o.shipment.trackingNumber}</bdi>
            </p>
          </div>
          {o.shipment.trackingUrl ? (
            <a href={o.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-soft px-4 text-ui font-bold text-accent hover:bg-accent hover:text-on-accent">
              تتبّع الشحنة
              <ExternalLink aria-hidden className="size-4" />
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="flex flex-col gap-5">
          <Panel title="المنتجات">
            <ul className="flex flex-col divide-y divide-line">
              {o.items.map((it) => (
                <li key={`${it.productId}-${it.variantId}`} className="flex items-center gap-3 py-3 first:pt-0">
                  <Link href={`/product/${it.productId}`} className="relative grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken">
                    {it.imageUrl ? <Image src={it.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : <Package aria-hidden className="size-6 text-ink-3" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${it.productId}`} className="line-clamp-2 text-ui font-semibold hover:text-accent">
                      {it.title}
                    </Link>
                    <p className="text-meta text-ink-3">{[it.size, it.color, `${num(it.quantity)} × ${price(it.unitPrice)}`].filter(Boolean).join(' · ')}</p>
                  </div>
                  <p className="shrink-0 text-ui font-bold">{price(it.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-ui">
              <Row label="المنتجات" value={price(o.subtotal)} />
              <Row label={pickup ? 'الاستلام' : 'الشحن'} value={o.shippingFee ? price(o.shippingFee) : 'مجاني'} />
              {o.coupon?.discount ? <Row label={`كود الخصم ${o.coupon.code}`} value={`- ${price(o.coupon.discount)}`} tone="success" /> : null}
              {o.points?.discount ? <Row label={`خصم ${num(o.points.used)} نقطة`} value={`- ${price(o.points.discount)}`} tone="success" /> : null}
              {(() => {
                const other = o.discountTotal - (o.coupon?.discount ?? 0) - (o.points?.discount ?? 0);
                return other > 0 ? <Row label="خصم" value={`- ${price(other)}`} tone="success" /> : null;
              })()}
              <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
                <dt className="font-bold">{o.paymentStatus === 'PAID' ? 'الإجمالي (اتدفع)' : 'الإجمالي (كاش عند الاستلام)'}</dt>
                <dd className="text-section font-extrabold">{price(o.grandTotal)}</dd>
              </div>
            </dl>
          </Panel>

          {o.gift ? (
            <div className="flex gap-3 rounded-panel border border-line bg-surface p-4">
              <Gift aria-hidden className="size-5 shrink-0 text-accent" />
              <div className="text-ui">
                <p className="font-bold">طلب هدية</p>
                <p className="text-ink-2">{o.gift.message ? `الكارت: «${o.gift.message}»` : 'من غير فاتورة بالسعر جوه الطرد.'}</p>
              </div>
            </div>
          ) : null}
          {o.points?.earned ? (
            <div className="flex gap-3 rounded-panel bg-success-soft p-4 text-success">
              <Coins aria-hidden className="size-5 shrink-0" />
              <p className="text-ui font-bold">كسبت {num(o.points.earned)} نقطة من الطلب ده. تقدر تستخدمها خصم في أي متجر.</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="حالة الطلب">
            <OrderTimeline order={o} />
            {canCancel(o.status) ? (
              <div className="mt-5 border-t border-line pt-4">
                {o.status === 'PENDING' ? <p className="mb-3 text-meta text-ink-3">تقدر تلغي الطلب مجاناً لحد ما المتجر يأكده.</p> : null}
                <CancelOrder orderId={o.id} className="w-full" />
              </div>
            ) : null}
          </Panel>

          <Panel title={pickup ? 'الاستلام من المتجر' : 'عنوان التوصيل'}>
            {pickup ? (
              <div className="flex flex-col gap-1 text-ui">
                <p className="flex items-center gap-2 font-bold">
                  <Store aria-hidden className="size-4 text-accent" />
                  {o.brand.name}
                </p>
                {o.pickup?.address ? <p className="text-ink-2">{o.pickup.address}</p> : null}
                {o.pickup?.hours ? <p className="text-meta text-ink-3">المواعيد: {o.pickup.hours}</p> : null}
                {o.pickup?.mapUrl ? (
                  <a href={o.pickup.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-accent-soft px-4 font-bold text-accent hover:bg-accent hover:text-on-accent">
                    <MapPin aria-hidden className="size-4" />
                    افتح على الخريطة
                  </a>
                ) : null}
              </div>
            ) : o.address ? (
              <div className="flex flex-col gap-1 text-ui">
                <p className="flex items-center gap-2 font-bold">
                  <MapPin aria-hidden className="size-4 text-accent" />
                  {o.address.recipientName}
                </p>
                <p className="text-ink-2">{addressLine(o.address)}</p>
                {o.address.landmark ? <p className="text-meta text-ink-3">{o.address.landmark}</p> : null}
                <p className="text-meta text-ink-3">
                  <bdi dir="ltr">{formatPhone(o.address.phone)}</bdi>
                </p>
              </div>
            ) : null}
            {o.notes ? <p className="mt-3 rounded-card bg-sunken p-3 text-meta text-ink-2">ملاحظاتك: {o.notes}</p> : null}
          </Panel>

          <Panel title="محتاج مساعدة؟">
            {phone ? (
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${phone}`} className={contactBtn}>
                  <Phone aria-hidden className="size-4" />
                  كلّم المتجر
                </a>
                <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={contactBtn}>
                  <MessageCircle aria-hidden className="size-4" />
                  واتساب
                </a>
              </div>
            ) : null}
            <p className={phone ? 'mt-4 text-meta text-ink-3' : 'text-meta text-ink-3'}>الإرجاع والشكاوى وتقييم المنتجات من تطبيق فاترينة دلوقتي.</p>
            <OpenInApp path={appPath.orders} variant="secondary" className="mt-2 w-full text-ui">
              <Smartphone aria-hidden className="size-4" />
              افتح طلباتك في التطبيق
            </OpenInApp>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-2">{label}</dt>
      <dd className={tone === 'success' ? 'font-semibold text-success' : 'font-semibold'}>{value}</dd>
    </div>
  );
}
