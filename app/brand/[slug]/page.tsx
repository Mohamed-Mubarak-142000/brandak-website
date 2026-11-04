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
import { excerpt, plainText } from '@/lib/format';
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

/** Anchors sit below the sticky site header (and, on desktop, this page's tab bar). */
const anchor = 'scroll-mt-36 sm:scroll-mt-48 lg:scroll-mt-60';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getBrand(slug);
  if (!store) return { title: 'المتجر مش موجود' };
  const info = storeTypeInfo(store.storeType);
  const description = excerpt(store.description ?? '') || `${info.label} على فاترينة: اتفرّج على منتجاته واطلب منه هنا أو من التطبيق، والدفع عند الاستلام.`;
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
  const info = storeTypeInfo(store.storeType);
  const description = plainText(store.description ?? '');

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

  const tabs = [
    { href: '#products', label: 'المنتجات' },
    { href: '#delivery', label: 'التوصيل والاسترجاع' },
    { href: '#about', label: 'عن المتجر' },
  ];

  return (
    <Container className="pb-16 pt-4 sm:pb-20 sm:pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <StoreHeader store={store} productCount={products.total} />

      {/* In-page tabs; they stick under the site header on desktop. */}
      <nav aria-label="أقسام صفحة المتجر" className="z-30 mt-8 border-b border-line bg-surface/95 backdrop-blur lg:sticky lg:top-41">
        <ul className="rail -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <li key={t.href} className="shrink-0">
              <a
                href={t.href}
                className="-mb-px flex min-h-12 items-center border-b-[3px] border-transparent px-4 text-ui font-bold text-ink-2 transition-colors hover:border-brand hover:text-ink"
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section id="products" aria-labelledby="products-title" className={anchor}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="products-title" className="text-section font-extrabold sm:text-page">
                منتجات {store.name}
              </h2>
              {products.total ? <p className="mt-0.5 text-ui text-ink-3">{countOf(products.total, 'منتج', 'منتجات')}</p> : null}
            </div>
          </div>
          {products.total > 1 ? (
            <div className="mb-5">
              <SortLinks options={[...SORTS]} current={sort} hrefFor={(s) => hrefWith(path, { sort: s === 'newest' ? undefined : s })} />
            </div>
          ) : null}

          {products.items.length ? (
            <>
              {/* ProductGrid goes to five columns; beside the side card three or four fit better. */}
              <div className="[&>ul]:xl:grid-cols-4 [&>ul]:lg:grid-cols-3">
                <ProductGrid products={products.items} priorityCount={page === 1 ? 2 : 0} />
              </div>
              <Pagination path={path} query={{ sort: sortQuery }} page={page} total={products.total} limit={LIMIT} />
            </>
          ) : page > 1 ? (
            <EmptyState
              art="box"
              title="الصفحة دي فاضية"
              action={
                <Link href={hrefWith(path, { sort: sortQuery })} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand">
                  ارجع لأول صفحة
                </Link>
              }
            />
          ) : (
            <EmptyState
              art="box"
              title="المتجر لسه بيرصّ فاترينته"
              body="مفيش منتجات معروضة دلوقتي. تابع المتجر ويوصلك إشعار أول ما ينزّل منتجات."
              action={
                <OpenInApp path={appPath.brand(store.slug)} variant="secondary">
                  تابع المتجر في التطبيق
                </OpenInApp>
              }
            />
          )}
        </section>

        <aside aria-label="معلومات الطلب من المتجر" className="lg:sticky lg:top-60 lg:max-h-[calc(100dvh-16rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <div className="space-y-4">
            <section id="delivery" aria-labelledby="delivery-title" className={`rounded-panel border border-line bg-surface p-5 ${anchor}`}>
              <h2 id="delivery-title" className="mb-4 text-section font-extrabold">
                التوصيل والاسترجاع
              </h2>
              <StoreInfo store={store} governorates={governorates} />
              <a href="#products" className="mt-5 flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover">
                تسوّق من المتجر
              </a>
            </section>
            <StoreTypePanel type={store.storeType} />
          </div>
        </aside>
      </div>

      <section id="about" aria-labelledby="about-title" className={`mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] ${anchor}`}>
        <div className="rounded-panel border border-line bg-surface p-5 sm:p-6">
          <h2 id="about-title" className="text-section font-extrabold">
            عن {store.name}
          </h2>
          <p className="mt-3 whitespace-pre-line text-body text-ink-2">
            {description || `${store.name} ${info.label} على فاترينة. ${info.description}.`}
          </p>
        </div>
        <AppPerks compact path={appPath.brand(store.slug)} />
      </section>
    </Container>
  );
}
