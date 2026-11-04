import type { Metadata } from 'next';

import { OrdersList } from '@/components/account/OrdersList';
import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { authed, requireSession } from '@/lib/session';
import type { OrderSummary } from '@/lib/types';

export const metadata: Metadata = {
  title: 'طلباتي',
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const { token } = await requireSession('/account/orders');
  const res = await authed<OrderSummary[]>('orders/me', token, { search: '?limit=20&page=1' });

  return (
    <>
      <PageTitle title="طلباتي" body="كل طلباتك من كل المتاجر، وحالة كل طلب لحظة بلحظة." />
      {res.ok && res.data ? <OrdersList initial={res.data} total={Number(res.meta?.total ?? res.data.length)} /> : <LoadError what="طلباتك" retryHref="/account/orders" />}
    </>
  );
}
