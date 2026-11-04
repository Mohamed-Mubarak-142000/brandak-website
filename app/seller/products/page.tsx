import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { Alert, btn } from '@/components/auth/fields';
import { ProductsList } from '@/components/seller/products/ProductsList';
import type { BrandProduct } from '@/components/seller/products/types';
import { authed, requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'المنتجات',
  robots: { index: false, follow: false },
};

const SAVED: Record<string, string> = {
  active: 'المنتج اتنشر وبقى ظاهر للعملاء.',
  draft: 'المنتج اتحفظ كمسودة. محدش هيشوفه لحد ما تنشره.',
  archived: 'المنتج اتأرشف. تقدر ترجّعه من «مؤرشف».',
};

export default async function SellerProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { token } = await requireSeller('/seller/products');
  const { saved } = await searchParams;
  const res = await authed<BrandProduct[]>('brand/products', token, { search: '?limit=20&page=1' });

  return (
    <>
      <PageTitle
        title="المنتجات"
        body="ضيف منتجاتك، عدّل أسعارها ومخزونها، وانشرها في متجرك."
        action={
          <Link href="/seller/products/new" className={btn.primary}>
            <Plus aria-hidden className="size-5" />
            منتج جديد
          </Link>
        }
      />
      {saved && SAVED[saved] ? <Alert tone="success" title={SAVED[saved]} className="mb-4" /> : null}
      {res.ok && res.data ? (
        <ProductsList initial={res.data} total={Number(res.meta?.total ?? res.data.length)} />
      ) : (
        <LoadError what="منتجاتك" retryHref="/seller/products" />
      )}
    </>
  );
}
