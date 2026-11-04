'use client';

import { Banknote, CircleAlert, Coins, ExternalLink, Gift, Loader2, MapPin, Package, Plus, ShieldCheck, Store, TicketPercent, Truck, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AddressForm } from '@/components/account/AddressForm';
import { addressLine } from '@/components/account/AddressCard';
import { notifyCartChanged } from '@/components/header/AccountNav';
import { api, ApiError } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num, price } from '@/lib/format';
import type { Address, CartView, OrderDetail, PricedLine, Quote } from '@/lib/types';

import { ConfirmOrder } from './ConfirmOrder';
import { isCode, latinDigits, shopError } from './errors';

type Body = { addressId?: string; fulfillment?: 'PICKUP'; couponCode?: string; usePoints?: boolean };
type Pickup = { address: string; hours: string; mapUrl: string | null };

const field =
  'w-full rounded-card border border-line-strong bg-surface px-3.5 py-2.5 text-body text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-brand focus-visible:outline-2 focus-visible:outline-brand';

/**
 * One page, three steps: where it goes (saved address, a new one, or pickup), extras (coupon,
 * points, gift, notes), and the summary with the confirm button. Every change re-quotes on the
 * server, so the total shown is the one the order is placed with (sent back as expectedTotal).
 */
export function CheckoutForm({
  cart,
  addresses: initialAddresses,
  addressesFailed,
  pickup,
  user,
}: {
  cart: CartView;
  addresses: Address[];
  addressesFailed: boolean;
  pickup: Pickup | null;
  user: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const brandId = cart.brand.id;
  const [addresses, setAddresses] = useState(initialAddresses);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(initialAddresses.length === 0 && !addressesFailed);
  const [fulfillment, setFulfillment] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [gift, setGift] = useState(false);
  const [giftMsg, setGiftMsg] = useState('');
  const [hidePrices, setHidePrices] = useState(true);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [awaiting, setAwaiting] = useState<OrderDetail | null>(null);
  // One key per checkout attempt: a double click or a retry on a flaky network never makes two orders.
  const idem = useRef<string | null>(null);

  const isPickup = fulfillment === 'PICKUP' && !!pickup;
  const addressId = pickedId ?? (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? null;

  const bodyFor = (code: string | null): Body | null => {
    const extra = { couponCode: code ?? undefined, usePoints: usePoints || undefined };
    if (isPickup) return { fulfillment: 'PICKUP', ...extra };
    return addressId ? { addressId, ...extra } : null;
  };
  const body = bodyFor(coupon);
  const key = body ? JSON.stringify(body) : null;

  // Quote results are tagged with the request they answer; "loading" = the latest one isn't back yet.
  const [result, setResult] = useState<{ key: string; quote?: Quote; error?: unknown } | null>(null);
  useEffect(() => {
    if (!key) return;
    let alive = true;
    api
      .post<Quote>(`checkout/${brandId}/quote`, JSON.parse(key))
      .then((quote) => alive && setResult({ key, quote }))
      .catch((error) => alive && setResult({ key, error }));
    return () => {
      alive = false;
    };
  }, [key, brandId]);

  const fresh = !!key && result?.key === key;
  const quoting = !!key && !fresh;
  const quote = result?.quote ?? null;
  const quoteError = fresh ? result?.error : null;
  const blocked = cart.hasIssues || !cart.acceptingOrders;
  const canPlace = fresh && !!result?.quote && !blocked && !placing;

  const applyCoupon = async () => {
    const code = latinDigits(couponInput).trim().toUpperCase();
    const b = bodyFor(code);
    if (code.length < 3 || !b) return;
    setCheckingCoupon(true);
    setCouponError(null);
    try {
      const q = await api.post<Quote>(`checkout/${brandId}/quote`, b);
      setResult({ key: JSON.stringify(b), quote: q });
      setCoupon(code);
      setCouponInput('');
    } catch (e) {
      setCouponError(shopError(e, 'الكود ده مش شغال.'));
    } finally {
      setCheckingCoupon(false);
    }
  };

  const place = async () => {
    if (!canPlace || !body || !quote) return;
    setPlacing(true);
    setPlaceError(null);
    setNotice(null);
    idem.current ??= crypto.randomUUID();
    try {
      const order = await api.post<OrderDetail>(
        `checkout/${brandId}/orders`,
        {
          ...body,
          paymentMethod: 'COD',
          notes: notes.trim() || undefined,
          expectedTotal: quote.grandTotal,
          gift: gift && !isPickup ? { message: giftMsg.trim() || undefined, hidePrices } : undefined,
        },
        { idempotencyKey: idem.current },
      );
      notifyCartChanged();
      // New customers confirm a cash order with an emailed code before the store sees it.
      if (order.status === 'AWAITING_CONFIRMATION') {
        setAwaiting(order);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.replace(`/checkout/${brandId}/done?order=${order.id}`);
      }
    } catch (e) {
      if (isCode(e, 'PRICE_CHANGED', 'POINTS_CHANGED')) {
        // A new attempt with the new total.
        idem.current = crypto.randomUUID();
        try {
          const q = await api.post<Quote>(`checkout/${brandId}/quote`, body);
          setResult({ key: JSON.stringify(body), quote: q });
          setNotice(`${shopError(e)} الإجمالي دلوقتي ${price(q.grandTotal)}.`);
        } catch (err) {
          setResult({ key: JSON.stringify(body), error: err });
        }
      } else if (e instanceof ApiError && e.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/checkout/${brandId}`)}`);
      } else {
        setPlaceError(shopError(e, 'معرفناش نبعت الطلب. جرّب تاني.'));
      }
    } finally {
      setPlacing(false);
    }
  };

  if (awaiting) return <ConfirmOrder order={awaiting} email={user.email} />;

  const lines: PricedLine[] = quote?.items ?? cart.items;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-8">
      <div className="min-w-0 space-y-5">
        {blocked ? (
          <Banner tone="danger">
            {!cart.acceptingOrders ? 'المتجر مش بيستقبل طلبات دلوقتي.' : 'فيه منتجات في السلة محتاجة مراجعة (خلصت أو الكمية مش متاحة).'}{' '}
            <Link href="/cart" className="font-bold underline underline-offset-4">
              ارجع للسلة
            </Link>
          </Banner>
        ) : null}

        <Step n={1} title={isPickup ? 'الاستلام' : 'التوصيل'}>
          {pickup ? (
            <div role="radiogroup" aria-label="طريقة الاستلام" className="mb-4 grid gap-2 sm:grid-cols-2">
              <Choice checked={!isPickup} onChange={() => setFulfillment('DELIVERY')} name="fulfillment" icon={<Truck aria-hidden className="size-5" />} title="توصيل لعنواني" />
              <Choice checked={isPickup} onChange={() => setFulfillment('PICKUP')} name="fulfillment" icon={<Store aria-hidden className="size-5" />} title="هستلم من المتجر" body="من غير مصاريف شحن" />
            </div>
          ) : null}

          {isPickup && pickup ? (
            <div className="space-y-2 rounded-card bg-sunken p-4">
              <p className="flex items-start gap-2 text-ui font-semibold">
                <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {pickup.address || 'عنوان المتجر هيوصلك مع تأكيد الطلب'}
              </p>
              {pickup.hours ? <p className="text-meta text-ink-2">المواعيد: {pickup.hours}</p> : null}
              {pickup.mapUrl ? (
                <a href={pickup.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-ui font-bold text-accent hover:underline">
                  <MapPin aria-hidden className="size-4" />
                  افتح على الخريطة
                  <ExternalLink aria-hidden className="size-3.5" />
                </a>
              ) : null}
              <p className="text-meta text-ink-3">المتجر هيبلغك لما الطلب يبقى جاهز، وتدفع وانت بتستلم.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addressesFailed ? <Banner tone="danger">معرفناش نجيب عناوينك. حدّث الصفحة أو ضيف عنوان جديد.</Banner> : null}
              {addresses.length ? (
                <div role="radiogroup" aria-label="عنوان التوصيل" className="grid gap-2.5 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-card border p-3.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand',
                        a.id === addressId ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface hover:border-brand',
                      )}
                    >
                      <input type="radio" name="address" className="mt-1 size-4 shrink-0 accent-accent" checked={a.id === addressId} onChange={() => setPickedId(a.id)} />
                      <span className="min-w-0">
                        <span className="block text-ui font-bold">
                          {a.label || 'عنوان'}
                          {a.isDefault ? <span className="ms-2 rounded-full bg-surface px-2 py-0.5 text-meta font-semibold text-ink-2">الافتراضي</span> : null}
                        </span>
                        <span className="block text-ui text-ink">{a.recipientName}</span>
                        <span className="block text-meta text-ink-2">{addressLine(a)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {adding ? (
                <div className="rounded-card border border-line p-4">
                  <h3 className="mb-3 text-body font-bold">عنوان جديد</h3>
                  <AddressForm
                    onSaved={(a: Address) => {
                      setAddresses((list) => [...list.filter((x) => x.id !== a.id), a]);
                      setPickedId(a.id);
                      setAdding(false);
                    }}
                    onCancel={addresses.length ? () => setAdding(false) : undefined}
                    defaults={{ recipientName: user.name, phone: user.phone }}
                    forceDefault={addresses.length === 0}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-5 text-ui font-bold hover:border-brand"
                >
                  <Plus aria-hidden className="size-4" />
                  عنوان جديد
                </button>
              )}
            </div>
          )}
        </Step>

        <Step n={2} title="خصومات وتفاصيل">
          <div className="space-y-5">
            <div>
              {coupon ? (
                <div className="flex items-center gap-3 rounded-card bg-success-soft px-4 py-2">
                  <TicketPercent aria-hidden className="size-5 shrink-0 text-success" />
                  <p className="flex-1 text-ui font-semibold text-success">
                    الكود <bdi dir="ltr">{coupon}</bdi> اتطبق
                    {quote?.coupon?.discount ? `، وفّرت ${price(quote.coupon.discount)}` : ''}
                  </p>
                  <button type="button" onClick={() => setCoupon(null)} className="inline-flex min-h-11 cursor-pointer items-center gap-1 px-2 text-ui font-bold text-ink-2 hover:text-danger">
                    <X aria-hidden className="size-4" />
                    شيل
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void applyCoupon();
                  }}
                >
                  <label htmlFor="coupon" className="text-ui font-bold">
                    كود خصم <span className="font-normal text-ink-3">(لو معاك)</span>
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      id="coupon"
                      dir="ltr"
                      autoCapitalize="characters"
                      autoComplete="off"
                      maxLength={20}
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError(null);
                      }}
                      placeholder="SAVE10"
                      aria-invalid={!!couponError || undefined}
                      aria-describedby={couponError ? 'coupon-error' : undefined}
                      className={cn(field, 'min-w-0 flex-1 uppercase', couponError && 'border-danger')}
                    />
                    <button
                      type="submit"
                      disabled={checkingCoupon || couponInput.trim().length < 3 || !body}
                      className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-card border border-ink bg-surface px-5 text-ui font-bold hover:bg-sunken disabled:cursor-not-allowed disabled:border-line-strong disabled:text-ink-3"
                    >
                      {checkingCoupon ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
                      تطبيق
                    </button>
                  </div>
                  {couponError ? (
                    <p id="coupon-error" role="alert" className="mt-1.5 text-meta font-semibold text-danger">
                      {couponError}
                    </p>
                  ) : !body ? (
                    <p className="mt-1.5 text-meta text-ink-3">اختار العنوان الأول.</p>
                  ) : null}
                </form>
              )}
            </div>

            {quote?.points && quote.points.balance > 0 ? (
              <Toggle
                icon={<Coins aria-hidden className="size-5 text-accent" />}
                title={`معاك ${num(quote.points.balance)} نقطة`}
                body={
                  quote.points.usable
                    ? `استخدم ${num(quote.points.usable)} نقطة واخصم ${price(quote.points.usableDiscount)}`
                    : quote.points.balance >= 100
                      ? 'الطلب صغير على استخدام النقاط (لحد ٢٠٪ من قيمته).'
                      : 'تقدر تستخدم النقاط من ١٠٠ نقطة.'
                }
                checked={usePoints && !!quote.points.usable}
                disabled={!quote.points.usable}
                onChange={setUsePoints}
              />
            ) : null}

            {!isPickup ? (
              <div className="space-y-3">
                <Toggle
                  icon={<Gift aria-hidden className="size-5 text-accent" />}
                  title="ده هدية"
                  body="كارت بكلامك جوه الطرد. اختار عنوان اللي هتهاديه."
                  checked={gift}
                  onChange={setGift}
                />
                {gift ? (
                  <div className="space-y-3 ps-1">
                    <div>
                      <label htmlFor="gift-msg" className="text-ui font-bold">
                        كلام الكارت <span className="font-normal text-ink-3">(اختياري)</span>
                      </label>
                      <textarea id="gift-msg" rows={2} maxLength={300} value={giftMsg} onChange={(e) => setGiftMsg(e.target.value)} placeholder="كل سنة وانت طيب" className={cn(field, 'mt-1.5 resize-y')} />
                    </div>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-ui">
                      <input type="checkbox" checked={hidePrices} onChange={(e) => setHidePrices(e.target.checked)} className="size-5 accent-accent" />
                      من غير فاتورة بالأسعار جوه الطرد
                    </label>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="notes" className="text-ui font-bold">
                ملاحظات للمتجر <span className="font-normal text-ink-3">(اختياري)</span>
              </label>
              <textarea id="notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلاً: اتصل قبل ما توصل" className={cn(field, 'mt-1.5 resize-y')} />
            </div>
          </div>
        </Step>
      </div>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-44">
        <section className="rounded-panel border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 id="summary-title" className="flex items-center gap-2 text-section font-extrabold">
            <span className="grid size-7 place-items-center rounded-full bg-ink text-meta font-bold text-ground">٣</span>
            ملخص الطلب
          </h2>

          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.itemId} className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-card bg-sunken">
                  {l.imageUrl ? <Image src={l.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <Package aria-hidden className="absolute inset-0 m-auto size-5 text-ink-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ui">{l.title}</span>
                  <span className="block text-meta text-ink-3">{[l.size, l.color, `× ${num(l.quantity)}`].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="shrink-0 text-ui font-semibold">{price(l.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className={cn('mt-4 space-y-2 border-t border-line pt-4 transition-opacity', quoting && quote && 'opacity-60')} aria-busy={quoting}>
            {quoteError ? (
              <Banner tone="danger">
                {shopError(quoteError)}
                {isCode(quoteError, 'COUPON_INVALID', 'COUPON_EXPIRED', 'COUPON_MIN_SUBTOTAL', 'COUPON_USED_UP', 'COUPON_ALREADY_USED', 'COUPON_NOT_STARTED') && coupon ? (
                  <>
                    {' '}
                    <button type="button" onClick={() => setCoupon(null)} className="cursor-pointer font-bold underline underline-offset-4">
                      شيل الكود
                    </button>
                  </>
                ) : isCode(quoteError, 'CART_HAS_ISSUES', 'CART_EMPTY') ? (
                  <>
                    {' '}
                    <Link href="/cart" className="font-bold underline underline-offset-4">
                      ارجع للسلة
                    </Link>
                  </>
                ) : null}
              </Banner>
            ) : quote ? (
              <>
                <Row label="المنتجات" value={price(quote.subtotal)} />
                <Row label={isPickup ? 'الاستلام' : 'الشحن'} value={quote.shippingFee ? price(quote.shippingFee) : 'مجاني'} good={!quote.shippingFee} />
                {quote.coupon?.discount ? <Row label={`خصم الكود ${quote.coupon.code}`} value={`- ${price(quote.coupon.discount)}`} good /> : null}
                {quote.points?.discount ? <Row label={`خصم ${num(quote.points.used)} نقطة`} value={`- ${price(quote.points.discount)}`} good /> : null}
                {!quote.coupon?.discount && !quote.points?.discount && quote.discountTotal > 0 ? <Row label="الخصم" value={`- ${price(quote.discountTotal)}`} good /> : null}
                <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-body font-bold">الإجمالي</span>
                  <strong className="text-section font-extrabold">{price(quote.grandTotal)}</strong>
                </div>
              </>
            ) : key ? (
              <div role="status" aria-label="بنحسب الإجمالي" className="space-y-2">
                <div className="h-4 animate-pulse rounded-full bg-skeleton" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-skeleton" />
                <div className="h-6 animate-pulse rounded-full bg-skeleton" />
              </div>
            ) : (
              <p className="text-ui text-ink-3">الشحن والإجمالي هيتحسبوا بعد ما تختار العنوان.</p>
            )}
          </div>

          <p className="mt-4 flex items-center gap-3 rounded-card border-2 border-brand bg-accent-soft px-3.5 py-3 text-ui">
            <Banknote aria-hidden className="size-6 shrink-0 text-accent" />
            <span>
              <strong className="block font-bold">الدفع كاش عند الاستلام</strong>
              <span className="text-meta text-ink-2">{isPickup ? 'تدفع وانت بتستلم من المتجر' : 'ادفع للمندوب لما الطلب يوصلك'}</span>
            </span>
          </p>

          {notice ? (
            <p role="alert" className="mt-4 rounded-card bg-warning-soft px-3.5 py-3 text-ui font-semibold text-warning">
              {notice}
            </p>
          ) : null}
          {placeError ? (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-card bg-danger-soft px-3.5 py-3 text-ui font-semibold text-danger">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {placeError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={place}
            disabled={!canPlace}
            aria-describedby="place-hint"
            className="mt-4 inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-body font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-3"
          >
            {placing ? <Loader2 aria-hidden className="size-5 animate-spin" /> : null}
            {placing ? 'بنبعت طلبك…' : quote && fresh ? `أكّد الطلب · ${price(quote.grandTotal)}` : 'أكّد الطلب'}
          </button>
          <p id="place-hint" className="mt-3 flex items-center justify-center gap-1.5 text-center text-meta text-ink-2">
            <ShieldCheck aria-hidden className="size-4 shrink-0 text-success" />
            تقدر تلغي الطلب مجانًا لحد ما المتجر يأكده.
          </p>
        </section>
      </aside>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-panel border border-line bg-surface p-4 sm:p-5">
      <h2 id={`step-${n}`} className="mb-4 flex items-center gap-2 text-section font-extrabold">
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink text-meta font-bold text-ground">
          {num(n)}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choice({ checked, onChange, name, icon, title, body }: { checked: boolean; onChange: () => void; name: string; icon: React.ReactNode; title: string; body?: string }) {
  return (
    <label
      className={cn(
        'flex min-h-14 cursor-pointer items-center gap-3 rounded-card border px-3.5 py-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand',
        checked ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong hover:border-brand',
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {icon}
      <span>
        <span className="block text-ui font-bold">{title}</span>
        {body ? <span className="block text-meta text-ink-2">{body}</span> : null}
      </span>
    </label>
  );
}

function Toggle({ icon, title, body, checked, disabled, onChange }: { icon: React.ReactNode; title: string; body: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={cn('flex items-center gap-3 rounded-card border p-3.5 has-focus-visible:outline-2 has-focus-visible:outline-brand', checked ? 'border-brand' : 'border-line', disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer')}>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-ui font-bold">{title}</span>
        <span className="block text-meta text-ink-2">{body}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')}>
        <span className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start]', checked ? 'start-6' : 'start-1')} />
      </span>
    </label>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-ui">
      <span className="text-ink-2">{label}</span>
      <span className={cn('font-semibold', good ? 'text-success' : 'text-ink')}>{value}</span>
    </div>
  );
}

function Banner({ tone, children }: { tone: 'danger' | 'warning'; children: React.ReactNode }) {
  return (
    <div role="alert" className={cn('flex items-start gap-2 rounded-card px-3.5 py-3 text-ui font-semibold', tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning')}>
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
