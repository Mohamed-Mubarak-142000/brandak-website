import { CircleCheck, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Container } from '@/components/Container';
import { date, num, price } from '@/lib/format';
import { authed, requireSession } from '@/lib/session';
import type { OrderDetail } from '@/lib/types';

export const metadata: Metadata = {
  title: 'طلبك اتبعت',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ brandId: string }>; searchParams: Promise<{ order?: string | string[] }> };

export default async function OrderDone({ params, searchParams }: Props) {
  const [{ brandId }, sp] = await Promise.all([params, searchParams]);
  const id = (Array.isArray(sp.order) ? sp.order[0] : sp.order) ?? '';
  const session = await requireSession(`/checkout/${brandId}/done?order=${encodeURIComponent(id)}`);
  if (!/^[a-f\d]{24}$/i.test(id)) redirect('/account/orders');

  const res = await authed<OrderDetail>(`orders/me/${id}`, session.token);
  const order = res.ok ? res.data : null;
  const waiting = order?.status === 'AWAITING_CONFIRMATION';

  return (
    <Container className="py-10 sm:py-16">
      <div className="mx-auto max-w-lg rounded-panel border border-line bg-surface p-6 text-center shadow-card sm:p-8">
        {waiting ? <Clock aria-hidden className="mx-auto size-14 text-warning" /> : <CircleCheck aria-hidden className="mx-auto size-14 text-success" />}
        <h1 className="mt-4 text-page font-extrabold">{waiting ? 'طلبك مستني تأكيدك' : 'طلبك اتبعت للمتجر'}</h1>
        <p className="mt-2 text-body text-ink-2">
          {waiting
            ? 'أكّد الطلب بالكود اللي على إيميلك من صفحة الطلب.'
            : order
              ? `${order.brand.name} هيراجع الطلب ويأكده. هيوصلك إشعار مع كل خطوة.`
              : 'المتجر هيراجع الطلب ويأكده. تقدر تتابعه من طلباتي.'}
        </p>

        {order ? (
          <dl className="mt-6 divide-y divide-line rounded-card bg-sunken px-4 text-ui">
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-ink-2">رقم الطلب</dt>
              <dd className="font-bold">
                <bdi dir="ltr">#{order.orderNumber}</bdi>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-ink-2">المنتجات</dt>
              <dd className="font-semibold">{num(order.itemsCount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-ink-2">{order.fulfillment === 'PICKUP' ? 'الاستلام' : 'التوصيل'}</dt>
              <dd className="min-w-0 truncate font-semibold">
                {order.fulfillment === 'PICKUP' ? (order.pickup?.address ?? 'من المتجر') : [order.address?.area, order.address?.city, order.address?.governorateName].filter(Boolean).join('، ')}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-ink-2">الإجمالي (كاش عند الاستلام)</dt>
              <dd className="text-body font-extrabold">{price(order.grandTotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <dt className="text-ink-2">التاريخ</dt>
              <dd className="font-semibold">{date(order.createdAt)}</dd>
            </div>
          </dl>
        ) : null}

        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          <Link href={order ? `/account/orders/${order.id}` : '/account/orders'} className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
            تابع طلبك
          </Link>
          <Link href="/cart" className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-5 font-bold hover:border-brand">
            ارجع للسلة
          </Link>
        </div>
        {order?.points?.earned ? <p className="mt-4 text-meta text-success">هتكسب {num(order.points.earned)} نقطة لما الطلب يتسلّم.</p> : null}
      </div>
    </Container>
  );
}
