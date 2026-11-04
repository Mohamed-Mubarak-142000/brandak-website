import type { Metadata } from 'next';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { loadFormData } from '@/components/seller/products/load';
import { ProductForm } from '@/components/seller/products/ProductForm';
import { requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'منتج جديد',
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const { token } = await requireSeller('/seller/products/new');
  const data = await loadFormData(token);

  return (
    <>
      <PageTitle title="منتج جديد" body="صور واضحة ووصف كويس ومقاسات مظبوطة = مبيعات أكتر." />
      {data ? <ProductForm brand={data.brand} categories={data.categories} /> : <LoadError what="بيانات المتجر" retryHref="/seller/products/new" />}
    </>
  );
}
