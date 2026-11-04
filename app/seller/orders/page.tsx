import { ChevronLeft, Search, X } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ORDER_STATUS_AR, StatusChip } from '@/components/account/orderStatus';
import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { inputClass } from '@/components/auth/fields';
import { Pagination } from '@/components/catalog/Pagination';
import { hrefWith, one, pageParam, type SearchParams } from '@/components/catalog/params';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/cn';
import { date, num, price } from '@/lib/format';
import type { SellerOrderSummary } from '@/lib/seller-types';
import { authed, requireSeller } from '@/lib/session';
import type { OrderStatus } from '@/lib/types';

export const metadata: Metadata = {
  title: 'الطلبات',
  robots: { index: false, follow: false },
};

/** AWAITING_CONFIRMATION orders aren't the store's yet: the API never lists them here. */
const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUSED'];
const LIMIT = 20;

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const { token } = await requireSeller(hrefWith('/seller/orders', sp, {}));
  const raw = one(sp.status);
  const status = STATUSES.find((s) => s === raw);
  const q = one(sp.q)?.slice(0, 40);
  const page = pageParam(sp);

  const qs = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
  if (status) qs.set('status', status);
  if (q) qs.set('q', q);

  const count = async (s?: OrderStatus) => {
    const r = await authed<unknown[]>('brand/orders', token, { search: `?limit=1${s ? `&status=${s}` : ''}` });
    return r.ok ? Number(r.meta?.total ?? 0) : null;
  };
  const [list, all, ...counts] = await Promise.all([authed<SellerOrderSummary[]>('brand/orders', token, { search: `?${qs}` }), count(), ...STATUSES.map((s) => count(s))]);

  const tabs: { key?: OrderStatus; label: string; n: number | null }[] = [{ label: 'كل الطلبات', n: all }, ...STATUSES.map((s, i) => ({ key: s, label: ORDER_STATUS_AR[s], n: counts[i] }))];
  const orders = list.ok ? (list.data ?? []) : null;
  const total = list.ok ? Number(list.meta?.total ?? orders?.length ?? 0) : 0;
  const self = hrefWith('/seller/orders', sp, {});

  return (
    <>
      <PageTitle title="الطلبات" body={orders ? `${num(total)} طلب${q ? ` فيها «${q}»` : ''}` : undefined} />

      <form action="/seller/orders" method="get" role="search" className="mb-4 flex gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label htmlFor="orders-q" className="sr-only">
          بحث برقم الطلب أو موبايل العميل
        </label>
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-ink-3" />
          <input id="orders-q" name="q" type="search" defaultValue={q} maxLength={40} placeholder="رقم الطلب أو موبايل العميل" className={cn(inputClass, 'ps-10')} />
        </div>
        <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
          بحث
        </button>
        {q ? (
          <Link href={hrefWith('/seller/orders', sp, { q: undefined, page: undefined })} aria-label="مسح البحث" className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-ink-2 hover:border-brand">
            <X aria-hidden className="size-4" />
          </Link>
        ) : null}
      </form>

      <nav aria-label="حالة الطلب" className="-mx-4 mb-5 sm:mx-0">
        <ul className="rail flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:px-0">
          {tabs.map((t) => {
            const on = t.key === status;
            return (
              <li key={t.key ?? 'all'} className="shrink-0">
                <Link
                  href={hrefWith('/seller/orders', sp, { status: t.key, page: undefined })}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-ui font-bold whitespace-nowrap transition-colors',
                    on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface text-ink-2 hover:border-brand',
                  )}
                >
                  {t.label}
                  {t.n != null ? (
                    <span className={cn('rounded-full px-1.5 text-meta', on ? 'bg-white/20' : t.key === 'PENDING' && t.n > 0 ? 'bg-danger text-white' : 'bg-sunken')}>{num(t.n)}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!orders ? (
        <LoadError what="الطلبات" retryHref={self} />
      ) : !orders.length ? (
        <EmptyState
          art={q ? 'search' : 'box'}
          title={q ? 'مفيش طلبات بالبحث ده' : status === 'PENDING' ? 'مفيش طلبات مستنية تأكيد' : 'مفيش طلبات هنا'}
          body={q ? 'جرّب رقم الطلب كامل أو موبايل العميل.' : 'الطلبات الجديدة هتظهر هنا وهيوصلك إشعار بيها.'}
        />
      ) : (
        <>
          {/* Phones: cards. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/seller/orders/${o.id}`} className="flex flex-col gap-2 rounded-panel border border-line bg-surface p-4 transition-colors hover:border-brand">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold">
                      <bdi>#{o.orderNumber}</bdi>
                    </span>
                    <StatusChip status={o.status} label={o.statusLabelAr} />
                  </span>
                  <span className="text-ui text-ink-2">{o.customer?.name ?? 'عميل'}</span>
                  <span className="flex items-center justify-between gap-2 text-meta text-ink-3">
                    <span>
                      {num(o.itemsCount)} قطعة · {date(o.createdAt)}
                    </span>
                    <span className="text-ui font-bold text-ink">{price(o.grandTotal)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Wider screens: a table. */}
          <div className="hidden overflow-hidden rounded-panel border border-line bg-surface md:block">
            <table className="w-full text-ui">
              <thead className="bg-sunken text-meta text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    الطلب
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    العميل
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    القطع
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    الإجمالي
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    التاريخ
                  </th>
                  <th scope="col" className="px-4 py-3 text-start font-bold">
                    الحالة
                  </th>
                  <th scope="col" className="w-10 px-2 py-3">
                    <span className="sr-only">فتح</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="relative transition-colors hover:bg-sunken">
                    <td className="px-4 py-3 font-bold">
                      <Link href={`/seller/orders/${o.id}`} className="after:absolute after:inset-0 hover:text-accent">
                        <bdi>#{o.orderNumber}</bdi>
                      </Link>
                    </td>
                    <td className="max-w-48 truncate px-4 py-3">{o.customer?.name ?? 'عميل'}</td>
                    <td className="px-4 py-3">{num(o.itemsCount)}</td>
                    <td className="px-4 py-3 font-bold">{price(o.grandTotal)}</td>
                    <td className="px-4 py-3 text-ink-2">{date(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={o.status} label={o.statusLabelAr} />
                    </td>
                    <td className="px-2 py-3 text-ink-3">
                      <ChevronLeft aria-hidden className="size-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination path="/seller/orders" searchParams={sp} page={page} total={total} limit={LIMIT} />
        </>
      )}
    </>
  );
}
