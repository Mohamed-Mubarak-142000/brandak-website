import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppPerks } from '@/components/AppPerks';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { ProductGrid } from '@/components/ProductCard';
import { hrefWith, pageParam, Pagination, stringParam } from '@/components/stores/Pagination';
import { SortLinks } from '@/components/stores/SortLinks';
import { StoreHeader } from '@/components/stores/StoreHeader';
import { StoreInfo } from '@/components/stores/StoreInfo';
import { StoreTypePanel } from '@/components/stores/StoreTypePanel';
import { countOf } from '@/components/stores/words';
import { getBrand, getBrandProducts, getGovernorates } from '@/lib/api';
import { excerpt } from '@/lib/format';
import { appPath, SITE_URL } from '@/lib/links';
import { storeTypeInfo } from '@/lib/store-types';

const LIMIT = 20;
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر من الأقل' },
  { value: 'price_desc', label: 'السعر من الأعلى' },
  { value: 'popular', label: 'الأكثر مبيعًا' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getBrand(slug);
  if (!store) return { title: 'المتجر مش موجود' };
  const info = storeTypeInfo(store.storeType);
  const description = excerpt(store.description ?? '') || `${info.label} على فاترينة: اتفرّج على منتجاته واطلب من التطبيق، والدفع عند الاستلام.`;
  const image = store.coverUrl ?? store.logoUrl;
  return {
    title: `${store.name} (${info.label})`,
    description,
    alternates: { canonical: `/brand/${store.slug}` },
    openGraph: { title: store.name, description, url: `/brand/${store.slug}`, ...(image ? { images: [image] } : {}) },
  };
}

export default async function StorePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const rawSort = stringParam(sp.sort);
  const sort: Sort = SORTS.some((s) => s.value === rawSort) ? (rawSort as Sort) : 'newest';
  const page = pageParam(sp.page);

  const [store, products, governorates] = await Promise.all([getBrand(slug), getBrandProducts(slug, { sort, page, limit: LIMIT }), getGovernorates()]);
  if (!store) notFound();

  const path = `/brand/${store.slug}`;
  const sortQuery = sort === 'newest' ? undefined : sort;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    url: `${SITE_URL}${path}`,
    ...(store.description ? { description: excerpt(store.description, 300) } : {}),
    ...(store.coverUrl || store.logoUrl ? { image: [store.coverUrl, store.logoUrl].filter(Boolean) } : {}),
    ...(store.logoUrl ? { logo: store.logoUrl } : {}),
    paymentAccepted: 'Cash',
    ...(store.ratingCount > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Math.round(store.ratingAvg * 10) / 10, reviewCount: store.ratingCount, bestRating: 5, worstRating: 1 } }
      : {}),
  };

  return (
    <Container className="pt-4 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <StoreHeader store={store} />

      <div className="mt-8">
        <StoreTypePanel type={store.storeType} />
      </div>

      <section aria-labelledby="products-title" className="mt-12">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="products-title" className="text-section font-extrabold sm:text-page">
              منتجات {store.name}
            </h2>
            {products.total ? <p className="mt-1 text-meta text-ink-3">{countOf(products.total, 'منتج', 'منتجات')}</p> : null}
          </div>
          {products.total > 1 ? <SortLinks options={[...SORTS]} current={sort} hrefFor={(s) => hrefWith(path, { sort: s === 'newest' ? undefined : s })} /> : null}
        </div>

        {products.items.length ? (
          <>
            <ProductGrid products={products.items} priorityCount={page === 1 ? 2 : 0} />
            <Pagination path={path} query={{ sort: sortQuery }} page={page} total={products.total} limit={LIMIT} />
          </>
        ) : page > 1 ? (
          <EmptyState
            art="box"
            title="الصفحة دي فاضية"
            action={
              <Link href={hrefWith(path, { sort: sortQuery })} className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                ارجع لأول صفحة
              </Link>
            }
          />
        ) : (
          <EmptyState
            art="box"
            title="المتجر لسه بيرصّ فاترينته"
            body="مفيش منتجات معروضة دلوقتي. تابع المتجر من التطبيق ويوصلك إشعار أول ما ينزّل منتجات."
            action={
              <OpenInApp path={appPath.brand(store.slug)} variant="secondary">
                تابع المتجر في التطبيق
              </OpenInApp>
            }
          />
        )}
      </section>

      <div className="mt-12">
        <StoreInfo store={store} governorates={governorates} />
      </div>

      <div className="mt-12">
        <AppPerks compact path={appPath.brand(store.slug)} />
      </div>
    </Container>
  );
}
