import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { loadFormData } from '@/components/seller/products/load';
import { ProductForm } from '@/components/seller/products/ProductForm';
import { STATUS_AR, type BrandProduct } from '@/components/seller/products/types';
import { authed, requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'تعديل المنتج',
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/seller/products/${encodeURIComponent(id)}`;
  const { token } = await requireSeller(path);
  const [res, data] = await Promise.all([authed<BrandProduct>(`brand/products/${encodeURIComponent(id)}`, token), loadFormData(token)]);
  if (res.status === 404 || res.status === 400) notFound();

  return (
    <>
      <PageTitle title="تعديل المنتج" body={res.data ? `${res.data.title} · ${STATUS_AR[res.data.status]}` : undefined} />
      {res.ok && res.data && data ? (
        <ProductForm key={res.data._id} product={res.data} brand={data.brand} categories={data.categories} />
      ) : (
        <LoadError what="المنتج" retryHref={path} />
      )}
    </>
  );
}
