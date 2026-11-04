import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CartBoard, type StoreCartData } from '@/components/cart/CartBoard';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { getBrand } from '@/lib/api';
import { authed, getSession } from '@/lib/session';
import type { CartSummary, CartView } from '@/lib/types';

export const metadata: Metadata = {
  title: 'السلة',
  robots: { index: false, follow: false },
};

const button = 'inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover';

export default async function CartPage() {
  const { session, stale } = await getSession();
  if (!session && stale) redirect('/api/auth/refresh?next=%2Fcart');

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-page font-extrabold">السلة</h1>
      <div className="mt-6 max-w-3xl">{session ? <Carts token={session.token} /> : <SignedOut />}</div>
    </Container>
  );
}

function SignedOut() {
  return (
    <EmptyState
      art="box"
      title="سجّل دخول عشان تشوف سلتك"
      body="سلتك محفوظة على حسابك، نفس اللي في التطبيق."
      action={
        <>
          <Link href="/login?next=%2Fcart" className={button}>
            تسجيل الدخول
          </Link>
          <Link href="/stores" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-6 font-bold hover:border-brand">
            اتفرّج على المتاجر
          </Link>
        </>
      }
    />
  );
}

async function Carts({ token }: { token: string }) {
  const res = await authed<CartSummary[]>('carts', token);
  if (!res.ok) {
    const seller = res.error?.code === 'SELLER_ACCOUNT';
    return (
      <EmptyState
        art={seller ? 'store' : 'empty'}
        title={seller ? 'حساب المتجر مينفعش يشتري' : 'معرفناش نجيب سلتك'}
        body={seller ? 'السلة والطلبات لحسابات العملاء. استخدم حساب عميل عشان تطلب.' : 'جرّب تحدّث الصفحة كمان شوية.'}
        action={
          <Link href={seller ? '/seller' : '/cart'} className={button}>
            {seller ? 'لوحة متجري' : 'حدّث الصفحة'}
          </Link>
        }
      />
    );
  }

  const summaries = res.data ?? [];
  const carts: StoreCartData[] = (
    await Promise.all(
      summaries.map(async (s) => {
        const [view, store] = await Promise.all([authed<CartView>(`carts/${s.brand.id}`, token), getBrand(s.brand.slug)]);
        if (!view.ok || !view.data?.items.length) return null;
        return {
          view: view.data,
          minOrderAmount: store?.shipping?.minOrderAmount || null,
          freeShippingThreshold: store?.shipping?.freeShippingThreshold ?? null,
        };
      }),
    )
  ).filter((c) => c !== null);

  return <CartBoard carts={carts} />;
}
