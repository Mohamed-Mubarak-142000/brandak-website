import { ChevronRight, ExternalLink, Gift, HandCoins, MapPin, MessageCircle, Package, Phone, ShieldAlert, ShieldCheck, Store, Truck, User } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { addressLine } from '@/components/account/AddressCard';
import { ORDER_STATUS_AR, StatusChip } from '@/components/account/orderStatus';
import { LoadError, Panel } from '@/components/account/PageTitle';
import { formatPhone } from '@/components/auth/validation';
import { OrderActions } from '@/components/seller/orders/OrderActions';
import { cn } from '@/lib/cn';
import { date, num, percent, price } from '@/lib/format';
import type { CustomerTrust, SellerOrderDetail } from '@/lib/seller-types';
import { authed, requireSeller } from '@/lib/session';
import type { OrderStatus } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: 'تفاصيل الطلب',
  robots: { index: false, follow: false },
};

const TRUST: Record<CustomerTrust['level'], { title: string; body: string; tone: string; icon: typeof ShieldCheck }> = {
  NEW: { title: 'عميل جديد', body: 'أول طلب ليه على فاترينة، وأكّده بكود على الإيميل.', tone: 'bg-sunken text-ink-2', icon: ShieldCheck },
  GOOD: { title: 'عميل موثوق', body: 'بيستلم طلباته.', tone: 'bg-success-soft text-success', icon: ShieldCheck },
  RISKY: { title: 'انتبه: رفض استلام قبل كده', body: 'اتأكد منه بالتليفون قبل ما تشحن.', tone: 'bg-danger-soft text-danger', icon: ShieldAlert },
};
const ACTOR = { CUSTOMER: 'العميل', BRAND: 'المتجر', ADMIN: 'فاترينة', SYSTEM: 'تلقائي' } as const;
const dateTime = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const contactBtn = 'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold hover:border-brand hover:text-accent';

export default async function SellerOrderPage({ params }: Props) {
  const { id } = await params;
  const path = `/seller/orders/${encodeURIComponent(id)}`;
  const { token } = await requireSeller(path);
  const res = await authed<SellerOrderDetail>(`brand/orders/${encodeURIComponent(id)}`, token);
  if (res.status === 404 || res.status === 400) notFound();
  const o = res.data;

  const back = (
    <Link href="/seller/orders" className="mb-4 inline-flex min-h-11 items-center gap-1 text-ui font-bold text-ink-2 hover:text-accent">
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
  const label = (s: OrderStatus) => (pickup && s === 'SHIPPED' ? 'جاهز للاستلام' : pickup && s === 'DELIVERED' ? 'اتسلم' : ORDER_STATUS_AR[s]);
  const phone = o.customer?.phone;
  const trust = o.customerTrust;
  const other = o.discountTotal - (o.coupon?.discount ?? 0) - (o.points?.discount ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        {back}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page font-extrabold">
            طلب <bdi>#{o.orderNumber}</bdi>
          </h1>
          <StatusChip status={o.status} label={pickup ? label(o.status) : o.statusLabelAr} className="text-ui" />
        </div>
        <p className="mt-1 text-ui text-ink-2">
          اتطلب {dateTime.format(new Date(o.createdAt))} · {num(o.itemsCount)} قطعة · {pickup ? 'استلام من المتجر' : 'توصيل'} · كاش عند الاستلام
        </p>
      </div>

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
              لينك التتبع
              <ExternalLink aria-hidden className="size-4" />
            </a>
          ) : null}
        </div>
      ) : null}

      {o.gift ? (
        <Note icon={Gift} title="الطلب ده هدية">
          {o.gift.hidePrices ? 'متحطش فاتورة بالسعر جوه الطرد. ' : ''}
          {o.gift.message ? `اطبع على الكارت: «${o.gift.message}»` : ''}
        </Note>
      ) : null}
      {o.resale ? (
        <Note icon={HandCoins} title="طلب مسوّق">
          العميل هيدفع {price(o.grandTotal)} (بسعر المسوّق). سعرك {price(o.subtotal - o.resale.margin)}، وربح المسوّق {price(o.resale.margin)} بيتضاف على حسابك مع فاترينة وبيتحوّله.
        </Note>
      ) : null}
      {o.cancelReason ? (
        <p className="rounded-panel bg-danger-soft p-4 text-ui text-danger">
          <span className="font-bold">سبب الإلغاء: </span>
          {o.cancelReason}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="flex flex-col gap-5">
          <Panel title="المنتجات">
            <ul className="flex flex-col divide-y divide-line">
              {o.items.map((it) => (
                <li key={`${it.productId}-${it.variantId}`} className="flex items-center gap-3 py-3 first:pt-0">
                  <span className="relative grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken">
                    {it.imageUrl ? <Image src={it.imageUrl} alt="" fill sizes="64px" className="object-cover" /> : <Package aria-hidden className="size-6 text-ink-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/seller/products/${it.productId}`} className="line-clamp-2 text-ui font-semibold hover:text-accent">
                      {it.title}
                    </Link>
                    <p className="text-meta text-ink-3">{[it.size, it.color, it.sku ? `SKU ${it.sku}` : null, `${num(it.quantity)} × ${price(it.unitPrice)}`].filter(Boolean).join(' · ')}</p>
                  </div>
                  <p className="shrink-0 text-ui font-bold">{price(it.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-ui">
              <Row label="المنتجات" value={price(o.subtotal)} />
              <Row label={pickup ? 'الاستلام' : 'الشحن'} value={o.shippingFee ? price(o.shippingFee) : 'مجاني'} />
              {o.coupon?.discount ? (
                <Row label={`كوبون ${o.coupon.code}${o.coupon.fundedBy === 'PLATFORM' ? ' (على حساب فاترينة، هيترد لك)' : ''}`} value={`- ${price(o.coupon.discount)}`} />
              ) : null}
              {o.points?.discount ? <Row label="خصم نقاط فاترينة (هيترد لك)" value={`- ${price(o.points.discount)}`} /> : null}
              {other > 0 ? <Row label="خصم" value={`- ${price(other)}`} /> : null}
              <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
                <dt className="font-bold">{o.paymentStatus === 'PAID' ? 'الإجمالي (اتدفع)' : 'تحصّل من العميل'}</dt>
                <dd className="text-section font-extrabold">{price(o.grandTotal)}</dd>
              </div>
              {o.commission ? (
                <Row label={`عمولة فاترينة (${percent(o.commission.rate)} من ${price(o.commission.base)})`} value={price(o.commission.amount)} muted />
              ) : (
                <p className="text-meta text-ink-3">عمولة فاترينة بتتحسب لما الطلب يتسلّم.</p>
              )}
            </dl>
          </Panel>

          <Panel title="السجل">
            <ol className="flex flex-col">
              {o.history.map((h, i) => {
                const last = i === o.history.length - 1;
                const bad = h.status === 'CANCELLED' || h.status === 'REFUSED';
                return (
                  <li key={`${h.status}-${h.at}`} className="relative flex gap-3 pb-5 last:pb-0">
                    {!last ? <span aria-hidden className="absolute top-4 bottom-0 start-[7px] w-0.5 bg-line" /> : null}
                    <span aria-hidden className={cn('relative mt-1 size-4 shrink-0 rounded-full border-2', bad ? 'border-danger bg-danger' : last ? 'border-accent bg-surface' : 'border-accent bg-accent')} />
                    <div className="min-w-0">
                      <p className={cn('text-ui font-bold', bad && 'text-danger')}>{label(h.status)}</p>
                      <p className="text-meta text-ink-3">
                        {dateTime.format(new Date(h.at))} · {ACTOR[h.actor]}
                      </p>
                      {h.note ? <p className="mt-1 text-meta text-ink-2">{h.note}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            {o.deliveredAt ? <p className="mt-4 text-meta text-ink-3">اتسلّم {date(o.deliveredAt)}</p> : null}
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="الخطوة الجاية">
            {!o.allowedNextStatuses.length ? <p className="mb-3 text-ui text-ink-2">الطلب ده خلص، مفيش خطوات تانية عليه.</p> : null}
            <OrderActions orderId={o.id} allowed={o.allowedNextStatuses} pickup={pickup} />
          </Panel>

          <Panel title="العميل">
            <p className="flex items-center gap-2 font-bold">
              <User aria-hidden className="size-4 text-accent" />
              {o.customer?.name ?? 'عميل'}
            </p>
            {phone ? (
              <>
                <p className="mt-1 text-ui text-ink-2">
                  <bdi dir="ltr">{formatPhone(phone)}</bdi>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`tel:${phone}`} className={contactBtn}>
                    <Phone aria-hidden className="size-4" />
                    اتصل
                  </a>
                  <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className={contactBtn}>
                    <MessageCircle aria-hidden className="size-4" />
                    واتساب
                  </a>
                </div>
              </>
            ) : null}
            {trust ? <TrustCard trust={trust} /> : null}
          </Panel>

          <Panel title={pickup ? 'الاستلام من المتجر' : 'عنوان التوصيل'}>
            {pickup ? (
              <div className="flex flex-col gap-1 text-ui">
                <p className="flex items-center gap-2 font-bold">
                  <Store aria-hidden className="size-4 text-accent" />
                  العميل هييجي ياخده من المتجر
                </p>
                {o.pickup?.address ? <p className="text-ink-2">{o.pickup.address}</p> : null}
                {o.pickup?.hours ? <p className="text-meta text-ink-3">المواعيد: {o.pickup.hours}</p> : null}
              </div>
            ) : o.address ? (
              <div className="flex flex-col gap-1 text-ui">
                <p className="flex items-center gap-2 font-bold">
                  <MapPin aria-hidden className="size-4 text-accent" />
                  {o.address.recipientName}
                </p>
                <p className="text-ink-2">{addressLine(o.address)}</p>
                {o.address.landmark ? <p className="text-meta text-ink-3">علامة مميزة: {o.address.landmark}</p> : null}
                {o.address.phone ? (
                  <a href={`tel:${o.address.phone}`} className="mt-1 inline-flex min-h-11 w-fit items-center gap-1.5 font-bold text-accent hover:underline">
                    <Phone aria-hidden className="size-4" />
                    <bdi dir="ltr">{formatPhone(o.address.phone)}</bdi>
                  </a>
                ) : null}
                {o.address.location ? (
                  <a
                    href={`https://www.google.com/maps?q=${o.address.location.lat},${o.address.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-accent-soft px-4 font-bold text-accent hover:bg-accent hover:text-on-accent"
                  >
                    <MapPin aria-hidden className="size-4" />
                    افتح على الخريطة
                  </a>
                ) : null}
              </div>
            ) : null}
            {o.notes ? <p className="mt-3 rounded-card bg-sunken p-3 text-meta text-ink-2">ملاحظات العميل: {o.notes}</p> : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TrustCard({ trust }: { trust: CustomerTrust }) {
  const t = TRUST[trust.level];
  const Icon = t.icon;
  const all = trust.delivered + trust.refused;
  return (
    <div className={cn('mt-4 flex gap-3 rounded-card p-3', t.tone)}>
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-ui font-bold">{t.title}</p>
        <p className="text-meta text-ink-2">
          {all > 0 ? `استلم ${num(trust.delivered)} من ${num(all)} طلب من كل المتاجر${trust.refused ? `، ورفض ${num(trust.refused)}` : ''}. ` : ''}
          {t.body}
        </p>
      </div>
    </div>
  );
}

function Note({ icon: Icon, title, children }: { icon: typeof Gift; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-panel border border-line bg-surface p-4">
      <Icon aria-hidden className="size-5 shrink-0 text-accent" />
      <div className="text-ui">
        <p className="font-bold">{title}</p>
        <p className="text-ink-2">{children}</p>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={muted ? 'text-ink-3' : 'text-ink-2'}>{label}</dt>
      <dd className={cn('shrink-0 font-semibold', muted && 'text-ink-2')}>{value}</dd>
    </div>
  );
}
