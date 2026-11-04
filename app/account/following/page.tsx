import type { Metadata } from 'next';
import Link from 'next/link';

import { LoadError, PageTitle, Panel } from '@/components/account/PageTitle';
import { EmptyState } from '@/components/EmptyState';
import { ProductGrid } from '@/components/ProductCard';
import { Rating } from '@/components/Rating';
import { StoreLogo } from '@/components/StoreCard';
import { num } from '@/lib/format';
import { authed, requireSession } from '@/lib/session';
import type { ProductCard } from '@/lib/types';

export const metadata: Metadata = { title: 'متاجر بتابعها', robots: { index: false, follow: false } };

interface FollowedBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
}

const storesWord = (n: number) => (n >= 3 && n <= 10 ? 'متاجر' : 'متجر');

/** Stores the customer follows, and their newest products. */
export default async function FollowingPage() {
  const session = await requireSession('/account/following');
  const [brands, feed] = await Promise.all([
    authed<FollowedBrand[]>('following/brands', session.token),
    authed<ProductCard[]>('following/products', session.token, { search: '?limit=24' }),
  ]);

  if (!brands.ok) {
    return (
      <>
        <PageTitle title="متاجر بتابعها" />
        <LoadError what="المتاجر" retryHref="/account/following" />
      </>
    );
  }
  const list = brands.data ?? [];
  const products = feed.ok ? (feed.data ?? []) : [];

  if (!list.length) {
    return (
      <>
        <PageTitle title="متاجر بتابعها" />
        <EmptyState
          art="store"
          title="لسه مش متابع متاجر"
          body="افتح أي متجر عجبك ودوس «تابع المتجر» عشان يوصلك جديده وعروضه."
          action={
            <Link href="/stores" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover">
              اكتشف المتاجر
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageTitle title="متاجر بتابعها" body={`بتتابع ${num(list.length)} ${storesWord(list.length)}. جديدهم بيظهر هنا.`} />
      <Panel>
        <ul className="rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {list.map((b) => (
            <li key={b.id} className="w-24 shrink-0">
              <Link href={`/brand/${b.slug}`} className="group flex flex-col items-center gap-1.5 rounded-card p-1 text-center">
                <StoreLogo store={b} size={64} />
                <span className="line-clamp-2 text-meta font-bold group-hover:text-accent">{b.name}</span>
                {b.ratingCount ? <Rating avg={b.ratingAvg} count={b.ratingCount} /> : null}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <h2 className="mt-8 mb-4 text-section font-extrabold">جديد المتاجر</h2>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <p className="rounded-panel border border-line bg-surface px-5 py-8 text-center text-ui text-ink-2">
          {feed.ok ? 'لسه مفيش منتجات جديدة. أول ما المتاجر اللي بتتابعها تنزّل حاجة، هتلاقيها هنا.' : 'معرفناش نجيب جديد المتاجر دلوقتي. جرّب تاني بعد شوية.'}
        </p>
      )}
    </>
  );
}
