import { ChevronLeft, CircleAlert, CircleCheck, MessageCircleQuestion, Package, PackageCheck, PackageX, Plus, ShieldAlert, Star, Undo2, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LoadError, PageTitle, Panel } from '@/components/account/PageTitle';
import { one, type SearchParams } from '@/components/catalog/params';
import { OpenInApp } from '@/components/OpenInApp';
import { Change } from '@/components/seller/bits';
import { getMyBrand } from '@/components/seller/data';
import { StatusBanner } from '@/components/seller/StatusBanner';
import { cn } from '@/lib/cn';
import { date, num, percent, price } from '@/lib/format';
import type { BrandOverview, CommissionStatus, SellerOrderSummary } from '@/lib/seller-types';
import { authed, requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'نظرة عامة',
  robots: { index: false, follow: false },
};

const RANGES = [7, 30, 90];
const DAY = 86_400_000;
const pill = 'inline-flex min-h-10 items-center rounded-full border px-4 text-ui font-bold transition-colors';
const quick = 'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-ui font-bold transition-colors';
const dayFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' });

export default async function SellerOverview({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { token } = await requireSeller('/seller');
  const sp = await searchParams;
  const days = RANGES.includes(Number(one(sp.days))) ? Number(one(sp.days)) : 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * DAY);
  const total = async (path: string, search: string) => {
    const r = await authed<unknown[]>(path, token, { search: `?limit=1&${search}` });
    return r.ok ? Number(r.meta?.total ?? 0) : 0;
  };

  const [brand, overview, commission, pending, todo] = await Promise.all([
    getMyBrand(),
    authed<BrandOverview>('brand/analytics/overview', token, { search: `?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}` }),
    authed<CommissionStatus>('brand/commissions', token),
    authed<SellerOrderSummary[]>('brand/orders', token, { search: '?status=PENDING&limit=5' }),
    Promise.all([
      total('brand/tickets', 'status=WAITING_STORE'),
      total('brand/returns', 'status=REQUESTED'),
      total('brand/questions', 'unanswered=true'),
      total('brand/reviews', 'unanswered=true'),
    ]),
  ]);

  if (!brand) return <LoadError what="بيانات متجرك" retryHref="/seller" />;
  const o = overview.ok ? overview.data : null;
  const c = commission.ok ? commission.data : null;
  const pendingOrders = pending.ok ? (pending.data ?? []) : [];
  const pendingCount = pending.ok ? Number(pending.meta?.total ?? pendingOrders.length) : (o?.orders.pendingNow ?? 0);
  const [complaints, returns, questions, reviews] = todo;
  const dueSoon = c && c.balance > 0 && c.dueBy && !c.pendingSettlement && new Date(c.dueBy).getTime() - to.getTime() < 3 * DAY;

  const appTodo = [
    { n: complaints, label: 'شكوى مستنية ردك', hint: 'رد خلال 48 ساعة', icon: ShieldAlert, path: 'seller/complaints', urgent: true },
    { n: returns, label: 'طلب إرجاع', hint: 'وافق أو ارفض', icon: Undo2, path: 'seller/returns' },
    { n: questions, label: 'سؤال من عميل', hint: 'الرد السريع بيبيع', icon: MessageCircleQuestion, path: 'seller/questions' },
    { n: reviews, label: 'تقييم من غير رد', hint: 'اشكر عميلك', icon: Star, path: 'seller/reviews' },
  ].filter((r) => r.n > 0);

  const week = (o?.daily ?? []).slice(-7);
  const maxSales = Math.max(1, ...week.map((d) => d.sales));

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title={brand.name}
        body="لوحة التحكم: طلباتك ومبيعاتك ومخزونك في مكان واحد."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/seller/products/new" className={cn(quick, 'bg-accent text-on-accent hover:bg-accent-hover')}>
              <Plus aria-hidden className="size-4" />
              إضافة منتج
            </Link>
            <Link href="/seller/orders?status=PENDING" className={cn(quick, 'border border-line-strong bg-surface hover:border-brand hover:text-accent')}>
              <Package aria-hidden className="size-4" />
              الطلبات الجديدة
              {pendingCount ? <span className="rounded-full bg-danger px-2 text-meta text-white">{num(pendingCount)}</span> : null}
            </Link>
          </div>
        }
      />

      <StatusBanner brand={brand} />

      {/* A store that owes too much commission (or for too long) stops receiving orders. */}
      {c?.blocked ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-panel border border-danger/20 bg-danger-soft p-4">
          <CircleAlert aria-hidden className="size-5 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-danger">متجرك واقف عن استقبال الطلبات</p>
            <p className="text-ui text-ink-2">عليك {price(c.balance)} لفاترينة. ادفعهم بـ InstaPay من التطبيق وهيرجع يستقبل طلبات.</p>
          </div>
          <OpenInApp path="seller/balance">ادفع من التطبيق</OpenInApp>
        </div>
      ) : dueSoon && c?.dueBy ? (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-panel border border-warning/20 bg-warning-soft p-4">
          <Wallet aria-hidden className="size-5 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-warning">
              ادفع {price(c.balance)} قبل {date(c.dueBy)}
            </p>
            <p className="text-ui text-ink-2">عشان المتجر يفضل يستقبل طلبات.</p>
          </div>
          <OpenInApp path="seller/balance">ادفع من التطبيق</OpenInApp>
        </div>
      ) : null}

      <Panel title="محتاج منك دلوقتي">
        {!pendingCount && !appTodo.length ? (
          <p className="flex items-center gap-2 text-ui font-semibold text-success">
            <CircleCheck aria-hidden className="size-5" />
            مفيش حاجة مستنياك دلوقتي
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {pendingCount ? (
              <li>
                <Link href="/seller/orders?status=PENDING" className="group flex min-h-14 items-center gap-3 py-2">
                  <TodoCount n={pendingCount} urgent />
                  <span className="min-w-0 flex-1">
                    <span className="block text-ui font-semibold group-hover:text-accent">طلب جديد محتاج تأكيد</span>
                    <span className="block text-meta text-ink-3">أكّد عشان العميل يطمّن</span>
                  </span>
                  <PackageCheck aria-hidden className="size-4 text-ink-3" />
                  <ChevronLeft aria-hidden className="size-4 text-ink-3" />
                </Link>
              </li>
            ) : null}
            {appTodo.map((r) => (
              <li key={r.label} className="flex min-h-14 flex-wrap items-center gap-3 py-2">
                <TodoCount n={r.n} urgent={r.urgent} />
                <span className="min-w-0 flex-1">
                  <span className="block text-ui font-semibold">{r.label}</span>
                  <span className="block text-meta text-ink-3">{r.hint}</span>
                </span>
                <OpenInApp path={r.path} variant="quiet" className="min-h-10 text-ui">
                  رد من التطبيق
                </OpenInApp>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div role="group" aria-label="الفترة" className="flex flex-wrap gap-2">
        {RANGES.map((d) => (
          <Link
            key={d}
            href={d === 30 ? '/seller' : `/seller?days=${d}`}
            aria-current={d === days ? 'true' : undefined}
            scroll={false}
            className={cn(pill, d === days ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface text-ink-2 hover:border-brand')}
          >
            آخر {num(d)} يوم
          </Link>
        ))}
      </div>

      {!o ? (
        <LoadError what="أرقام المتجر" retryHref={days === 30 ? '/seller' : `/seller?days=${days}`} />
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi label="المبيعات" value={price(o.salesValue)} change={<Change pct={o.salesChangePct} />} />
            <Kpi label="الطلبات" value={num(o.orders.count)} change={<Change pct={o.orders.changePct} />} />
            <Kpi label="إيراد الطلبات المستلمة" value={price(o.deliveredRevenue)} />
            <Kpi label="متوسط الطلب" value={price(o.averageOrderValue)} />
          </dl>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="مبيعات آخر 7 أيام">
              {week.some((d) => d.sales > 0 || d.orders > 0) ? (
                <ul className="flex flex-col gap-2.5">
                  {week.map((d) => (
                    <li key={d.date} className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 text-meta">
                      <span className="text-ink-2">{dayFmt.format(new Date(d.date))}</span>
                      <span aria-hidden className="h-3 overflow-hidden rounded-full bg-sunken">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.max(d.sales ? 3 : 0, (d.sales / maxSales) * 100)}%` }} />
                      </span>
                      <span className="text-end">
                        <span className="font-bold text-ink">{price(d.sales)}</span>
                        <span className="text-ink-3"> · {num(d.orders)} طلب</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ui text-ink-3">مفيش مبيعات في آخر 7 أيام لسه.</p>
              )}
            </Panel>

            <Panel
              title="مستنية تأكيدك"
              action={
                <Link href="/seller/orders?status=PENDING" className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-ui font-bold text-accent hover:bg-accent-soft">
                  الكل
                  <ChevronLeft aria-hidden className="size-4" />
                </Link>
              }
            >
              {pendingOrders.length ? (
                <ul className="flex flex-col divide-y divide-line">
                  {pendingOrders.map((order) => (
                    <li key={order.id}>
                      <Link href={`/seller/orders/${order.id}`} className="group flex min-h-14 items-center gap-3 py-2">
                        <span className="min-w-0 flex-1">
                          <span className="block text-ui font-bold group-hover:text-accent">
                            <bdi>#{order.orderNumber}</bdi> · {order.customer?.name ?? 'عميل'}
                          </span>
                          <span className="block text-meta text-ink-3">
                            {num(order.itemsCount)} قطعة · {date(order.createdAt)}
                          </span>
                        </span>
                        <span className="text-ui font-bold">{price(order.grandTotal)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ui text-ink-3">مفيش طلبات مستنية تأكيد.</p>
              )}
            </Panel>

            {c ? (
              <Panel title="حسابك مع فاترينة">
                <p className="text-meta text-ink-3">{percent(c.commissionRate)} على الطلبات المستلمة بس</p>
                <p className={cn('mt-2 text-section font-extrabold', c.balance > 0 ? (c.blocked ? 'text-danger' : 'text-accent') : 'text-success')}>
                  {c.balance > 0 ? `مستحق ${price(c.balance)}` : 'مفيش مستحقات'}
                </p>
                {c.balance > 0 && c.dueBy ? <p className="mt-1 text-ui text-ink-2">آخر ميعاد للسداد {date(c.dueBy)}</p> : null}
                {c.pendingSettlement ? <p className="mt-1 text-ui text-ink-2">تحويل بـ {price(c.pendingSettlement.amount)} بيتراجع دلوقتي.</p> : null}
                {c.blocked ? <p className="mt-2 rounded-card bg-danger-soft p-2.5 text-meta font-bold text-danger">المتجر واقف عن استقبال طلبات لحد السداد.</p> : null}
                <p className="mt-2 text-meta text-ink-3">
                  الحد الأقصى للمستحق {price(c.maxUnpaidBalance)}، والسداد كل {num(c.settlementDays)} يوم.
                </p>
                <OpenInApp path="seller/balance" variant="secondary" className="mt-4">
                  التفاصيل والسداد في التطبيق
                </OpenInApp>
              </Panel>
            ) : null}

            {o.topProducts.length ? (
              <Panel title="الأكثر مبيعاً">
                <ol className="flex flex-col gap-3">
                  {o.topProducts.map((p, i) => (
                    <li key={p.productId} className="flex items-center gap-3">
                      <span className="w-4 text-center text-ui text-ink-3">{num(i + 1)}</span>
                      <Thumb src={p.imageUrl} />
                      <span className="min-w-0 flex-1 truncate text-ui">{p.title}</span>
                      <span className="text-end">
                        <span className="block text-ui font-bold">{num(p.quantity)} قطعة</span>
                        <span className="block text-meta text-ink-3">{price(p.revenue)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Panel>
            ) : null}

            {o.lowStock.length ? (
              <Panel title="مخزون قليل" className="xl:col-span-2">
                <ul className="flex flex-col divide-y divide-line">
                  {o.lowStock.map((p) => (
                    <li key={p.productId} className="flex flex-wrap items-center gap-3 py-2.5">
                      <PackageX aria-hidden className="size-4 shrink-0 text-warning" />
                      <Thumb src={p.imageUrl} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-ui font-semibold">{p.title}</span>
                        <span className="block text-meta text-warning">
                          {p.variants.map((v) => `${[v.size, v.color].filter(Boolean).join('/') || 'أساسي'}: ${num(v.stock)}`).join(' · ')}
                        </span>
                      </span>
                      <Link href={`/seller/products/${p.productId}`} className="inline-flex min-h-10 items-center rounded-full bg-accent-soft px-4 text-ui font-bold text-accent hover:bg-accent hover:text-on-accent">
                        تعديل
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, change }: { label: string; value: string; change?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-panel border border-line bg-surface p-4">
      <dt className="text-meta text-ink-3">{label}</dt>
      <dd className="truncate text-section font-extrabold">{value}</dd>
      {change ? <dd>{change}</dd> : null}
    </div>
  );
}

function TodoCount({ n, urgent }: { n: number; urgent?: boolean }) {
  return (
    <span className={cn('grid h-9 min-w-9 place-items-center rounded-full px-2 text-ui font-bold', urgent ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent')}>{num(n)}</span>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="relative grid h-12 w-10 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken">
      {src ? <Image src={src} alt="" fill sizes="40px" className="object-cover" /> : <Package aria-hidden className="size-4 text-ink-3" />}
    </span>
  );
}

