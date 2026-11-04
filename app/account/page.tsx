import { ChevronLeft, Coins, Heart, MapPin, Package, Settings, Store } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AddressCard } from '@/components/account/AddressCard';
import { SignOutButton } from '@/components/account/AccountSideNav';
import { OrderCard } from '@/components/account/OrderCard';
import { Panel } from '@/components/account/PageTitle';
import { requireSession, authed } from '@/lib/session';
import type { Address, OrderSummary } from '@/lib/types';

export const metadata: Metadata = {
  title: 'نظرة عامة',
  robots: { index: false, follow: false },
};

const QUICK = [
  { href: '/account/orders', label: 'طلباتي', body: 'تابع حالة كل طلب', icon: Package },
  { href: '/account/wishlist', label: 'المفضلة', body: 'المنتجات اللي حفظتها', icon: Heart },
  { href: '/account/following', label: 'المتاجر اللي بتابعها', body: 'جديدهم وعروضهم', icon: Store },
  { href: '/account/points', label: 'نقاطي', body: 'رصيدك وخصمك الجاي', icon: Coins },
  { href: '/account/addresses', label: 'العناوين', body: 'عناوين التوصيل', icon: MapPin },
  { href: '/account/settings', label: 'الإعدادات', body: 'بياناتك وكلمة السر', icon: Settings },
];

const seeAll = 'inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-ui font-bold text-accent hover:bg-accent-soft';

export default async function AccountPage() {
  const { user, token } = await requireSession('/account');
  const [orders, addresses] = await Promise.all([authed<OrderSummary[]>('orders/me', token, { search: '?limit=3' }), authed<Address[]>('addresses/me', token)]);
  const latest = orders.data ?? [];
  const address = addresses.data?.find((a) => a.isDefault) ?? addresses.data?.[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page font-extrabold">أهلاً {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-ui text-ink-2 sm:text-body">من هنا تتابع طلباتك وعناوينك وبيانات حسابك.</p>
      </div>

      <Panel
        title="آخر الطلبات"
        action={
          latest.length ? (
            <Link href="/account/orders" className={seeAll}>
              كل الطلبات
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
          ) : null
        }
      >
        {!orders.ok ? (
          <p role="alert" className="text-ui text-ink-2">
            معرفناش نجيب طلباتك دلوقتي.{' '}
            <a href="/account" className="font-bold text-accent hover:underline">
              جرّب تاني
            </a>
          </p>
        ) : latest.length ? (
          <ul className="flex flex-col gap-3">
            {latest.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-card bg-sunken p-4">
            <p className="text-ui text-ink-2">لسه معملتش طلبات. أول طلب ليك هيظهر هنا وتقدر تتابعه خطوة بخطوة.</p>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-ui font-bold text-on-accent hover:bg-accent-hover">
              ابدأ التسوق
            </Link>
          </div>
        )}
      </Panel>

      <Panel
        title="عنوان التوصيل"
        action={
          <Link href="/account/addresses" className={seeAll}>
            {address ? 'إدارة العناوين' : 'ضيف عنوان'}
            <ChevronLeft aria-hidden className="size-4" />
          </Link>
        }
      >
        {address ? (
          <AddressCard address={address} />
        ) : addresses.ok ? (
          <p className="text-ui text-ink-2">مفيش عنوان محفوظ. ضيف عنوانك عشان الطلب يخلص أسرع.</p>
        ) : (
          <p role="alert" className="text-ui text-ink-2">
            معرفناش نجيب عناوينك دلوقتي.
          </p>
        )}
      </Panel>

      <section aria-labelledby="quick">
        <h2 id="quick" className="sr-only">
          روابط سريعة
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK.map(({ href, label, body, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex h-full flex-col gap-2 rounded-panel border border-line bg-surface p-4 transition-shadow hover:shadow-card">
                <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="font-bold">{label}</span>
                <span className="text-meta text-ink-3">{body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="lg:hidden">
        <SignOutButton className="justify-center border border-line bg-surface" />
      </div>
    </div>
  );
}
