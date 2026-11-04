import type { Metadata } from 'next';
import Link from 'next/link';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, type SearchParams } from '@/components/catalog/params';
import { EmptyState } from '@/components/EmptyState';
import { ProductGrid } from '@/components/ProductCard';
import { num } from '@/lib/format';
import { authed, requireSession } from '@/lib/session';
import type { WishlistItem } from '@/lib/types';

export const metadata: Metadata = { title: 'المفضلة', robots: { index: false, follow: false } };

const LIMIT = 24;

export default async function WishlistPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = pageParam(sp);
  const session = await requireSession(page > 1 ? `/account/wishlist?page=${page}` : '/account/wishlist');
  const res = await authed<WishlistItem[]>('wishlists/me', session.token, { search: `?page=${page}&limit=${LIMIT}` });

  if (!res.ok) {
    return (
      <>
        <PageTitle title="المفضلة" />
        <LoadError what="المفضلة" retryHref="/account/wishlist" />
      </>
    );
  }

  const rows = res.data ?? [];
  const total = Number(res.meta?.total ?? rows.length);
  // Unavailable products come back as null (kept in case they return); they're left out here.
  const products = rows.map((w) => w.product).filter((p) => p !== null);
  const hidden = rows.length - products.length;

  return (
    <>
      <PageTitle title="المفضلة" body={total ? `${num(total)} منتج حفظته. دوس على القلب تاني عشان تشيله.` : undefined} />
      {products.length ? (
        <>
          <ProductGrid products={products} />
          {hidden ? <p className="mt-4 text-meta text-ink-3">{num(hidden)} منتج مبقاش متاح دلوقتي، وهيرجع هنا لو المتجر نزّله تاني.</p> : null}
          <Pagination path="/account/wishlist" searchParams={sp} page={page} total={total} limit={LIMIT} />
        </>
      ) : (
        <EmptyState
          art="box"
          title="المفضلة فاضية"
          body="دوس على القلب في أي منتج عجبك وهتلاقيه هنا."
          action={
            <Link href="/offers" className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover">
              اكتشف المنتجات
            </Link>
          }
        />
      )}
    </>
  );
}
