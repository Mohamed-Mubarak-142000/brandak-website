import type { Metadata } from 'next';
import Link from 'next/link';

import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { getBrand } from '@/lib/api';
import { authed, requireSession } from '@/lib/session';
import type { Address, CartView } from '@/lib/types';

export const metadata: Metadata = {
  title: 'إتمام الطلب',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ brandId: string }> };

const button = 'inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover';

export default async function CheckoutPage({ params }: Props) {
  const { brandId } = await params;
  const session = await requireSession(`/checkout/${brandId}`);
  const [cart, addresses] = await Promise.all([authed<CartView>(`carts/${brandId}`, session.token), authed<Address[]>('addresses/me', session.token)]);

  if (!cart.ok || !cart.data?.items.length) {
    const seller = cart.error?.code === 'SELLER_ACCOUNT';
    return (
      <Container className="py-10">
        <EmptyState
          art={seller ? 'store' : 'box'}
          title={seller ? 'حساب المتجر مينفعش يشتري' : cart.ok || cart.status === 404 ? 'سلة المتجر ده فاضية' : 'معرفناش نجيب سلتك'}
          body={seller ? 'استخدم حساب عميل عشان تطلب.' : 'ارجع للسلة وشوف المنتجات اللي ضفتها.'}
          action={
            <Link href="/cart" className={button}>
              ارجع للسلة
            </Link>
          }
        />
      </Container>
    );
  }

  const view = cart.data;
  const store = await getBrand(view.brand.slug);
  const pickup = store?.shipping?.pickup?.enabled ? store.shipping.pickup : null;

  return (
    <Container className="py-6 sm:py-10">
      <nav aria-label="مسار الطلب" className="text-ui text-ink-3">
        <Link href="/cart" className="inline-flex min-h-11 items-center font-semibold hover:text-accent">
          السلة
        </Link>
        <span aria-hidden className="mx-2">‹</span>
        <span aria-current="page">إتمام الطلب</span>
      </nav>
      <h1 className="text-page font-extrabold">إتمام طلب {view.brand.name}</h1>
      <div className="mt-6">
        <CheckoutForm
          cart={view}
          addresses={addresses.ok ? (addresses.data ?? []) : []}
          addressesFailed={!addresses.ok}
          pickup={pickup ? { address: pickup.address ?? '', hours: pickup.hours ?? '', mapUrl: pickup.mapUrl ?? null } : null}
          user={{ name: session.user.name, email: session.user.email, phone: session.user.phone }}
        />
      </div>
    </Container>
  );
}
