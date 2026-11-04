import { CalendarClock, CircleCheck, CircleX, Store } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppPerks } from '@/components/AppPerks';
import { Breadcrumbs, type Crumb } from '@/components/catalog/Breadcrumbs';
import { Container } from '@/components/Container';
import { OpenInApp } from '@/components/OpenInApp';
import { Price } from '@/components/Price';
import { DeliveryInfo } from '@/components/product/DeliveryInfo';
import { Gallery } from '@/components/product/Gallery';
import { ProductOptions } from '@/components/product/ProductOptions';
import { Reviews } from '@/components/product/Reviews';
import { SpecsTable } from '@/components/product/Specs';
import { StickyOrderBar } from '@/components/product/StickyOrderBar';
import { StoreTypeDetails } from '@/components/product/StoreTypeDetails';
import { ProductGrid } from '@/components/ProductCard';
import { Rating } from '@/components/Rating';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { getBrand, getBrandProducts, getCategories, getProduct, getReviews } from '@/lib/api';
import { date, excerpt, num, plainText } from '@/lib/format';
import { appPath, SITE_URL } from '@/lib/links';
import type { Category, ProductDetail } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'المنتج مش موجود' };
  const description = excerpt(product.description || `${product.title} من ${product.brand.name ?? 'فاترينة'}`);
  const image = product.images[0] ?? product.imageUrl;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: { type: 'website', title: product.title, description, images: image ? [image] : undefined },
  };
}

/** Home › each category level (linked when we can resolve it) — the leaf always links to its page. */
function crumbs(product: ProductDetail, categories: Category[]): Crumb[] {
  const home = { label: 'الرئيسية', href: '/' };
  const leaf = categories.find((c) => c._id === product.categoryId);
  if (leaf) {
    const byId = new Map(categories.map((c) => [c._id, c]));
    const chain = [...(leaf.ancestors ?? []).map((a) => byId.get(a)).filter((c) => c !== undefined), leaf];
    return [home, ...chain.map((c) => ({ label: c.nameAr, href: `/category/${c._id}` }))];
  }
  const parts = (product.categoryPath ?? '').split('›').map((p) => p.trim()).filter(Boolean);
  return [home, ...parts.map((label, i) => (i === parts.length - 1 && product.categoryId ? { label, href: `/category/${product.categoryId}` } : { label }))];
}

function jsonLd(product: ProductDetail) {
  const url = `${SITE_URL}/product/${product.id}`;
  const images = product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: excerpt(product.description || product.title, 500),
    sku: product.id,
    url,
    ...(product.brand.name ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EGP',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
      ...(product.sale?.endsAt ? { priceValidUntil: product.sale.endsAt.slice(0, 10) } : {}),
    },
  };
  if (product.ratingCount > 0) {
    data.aggregateRating = { '@type': 'AggregateRating', ratingValue: Math.round(product.ratingAvg * 10) / 10, ratingCount: product.ratingCount, bestRating: 5, worstRating: 1 };
  }
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function StockLine({ product }: { product: ProductDetail }) {
  if (!product.inStock) {
    return (
      <p className="inline-flex items-center gap-1.5 text-ui font-bold text-danger">
        <CircleX aria-hidden className="size-4" />
        خلصان دلوقتي
      </p>
    );
  }
  const left = product.variants.length ? product.variants.reduce((n, v) => n + (v.inStock ? v.available : 0), 0) : null;
  return (
    <p className="inline-flex items-center gap-1.5 text-ui font-bold text-success">
      <CircleCheck aria-hidden className="size-4" />
      متوفر
      {left !== null && left > 0 && left <= 5 ? <span className="font-semibold text-warning">، فاضل {num(left)} بس</span> : null}
    </p>
  );
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const slug = product.brand.slug;
  const [store, reviews, more, categories] = await Promise.all([
    slug ? getBrand(slug) : Promise.resolve(null),
    getReviews(product.id, 3),
    slug ? getBrandProducts(slug, { limit: 7 }) : Promise.resolve({ items: [] }),
    getCategories(),
  ]);

  const storeType = store?.storeType ?? 'BRAND';
  const others = more.items.filter((p) => p.id !== product.id).slice(0, 6);
  const images = product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const imageColors = product.images.length ? product.imageColors : undefined;
  const description = plainText(product.description ?? '');
  const storeName = store?.name ?? product.brand.name;
  const storeLogo = store?.logoUrl ?? product.brand.logoUrl;
  // The API only attaches a sale while it runs.
  const saleEnds = product.sale?.endsAt ?? null;
  const path = appPath.product(product.id);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product) }} />

      <Container className="pt-5 sm:pt-8">
        <Breadcrumbs items={crumbs(product, categories)} />

        <div className="mt-4 grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="md:sticky md:top-20 md:self-start">
            <Gallery images={images} imageColors={imageColors} title={product.title} colorLabel={product.colorLabel} />
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              {storeName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={slug ? `/brand/${slug}` : '/stores'} className="group inline-flex min-h-11 items-center gap-2">
                    <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-sunken">
                      {storeLogo ? <Image src={storeLogo} alt="" width={36} height={36} className="size-full object-cover" /> : <Store aria-hidden className="size-4 text-ink-3" />}
                    </span>
                    <span className="font-bold group-hover:text-accent group-hover:underline">{storeName}</span>
                  </Link>
                  <StoreTypeBadge type={storeType} />
                </div>
              ) : null}

              <h1 className="text-section font-extrabold leading-snug sm:text-page">{product.title}</h1>
              <Rating avg={product.ratingAvg} count={product.ratingCount} className="text-ui" />
            </div>

            <div className="space-y-2">
              <Price product={product} size="lg" />
              {product.unit && product.unit !== 'قطعة' ? <p className="text-meta text-ink-3">السعر لكل {product.unit}</p> : null}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <StockLine product={product} />
                {saleEnds ? (
                  <p className="inline-flex items-center gap-1.5 text-ui font-semibold text-danger">
                    <CalendarClock aria-hidden className="size-4" />
                    الخصم لحد {date(saleEnds)}
                  </p>
                ) : null}
              </div>
            </div>

            <ProductOptions variants={product.variants} sizeLabel={product.sizeLabel} colorLabel={product.colorLabel} />

            <StoreTypeDetails product={product} storeType={storeType} />

            <div className="rounded-panel border border-line bg-sunken p-4 sm:p-5">
              <OpenInApp path={path} className="min-h-13 w-full text-body">
                {product.inStock ? 'اطلبه من التطبيق' : 'افتحه في التطبيق'}
              </OpenInApp>
              <p className="mt-3 text-center text-meta text-ink-2">
                {product.inStock ? 'الدفع كاش لما الطلب يوصلك. ' : 'تابع المتجر من التطبيق ويوصلك الجديد. '}
                السلة والكوبونات والنقاط في التطبيق.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 space-y-10">
            {description ? (
              <section aria-labelledby="desc-title">
                <h2 id="desc-title" className="text-section font-extrabold">
                  عن المنتج
                </h2>
                <p className="mt-3 max-w-prose whitespace-pre-line text-body text-ink-2">{description}</p>
              </section>
            ) : null}
            <SpecsTable specs={product.specs ?? []} />
            <Reviews productId={product.id} items={reviews.items} total={reviews.total} stars={reviews.stars} avg={product.ratingAvg} />
          </div>
          {store ? (
            <div className="min-w-0">
              <DeliveryInfo store={store} />
            </div>
          ) : null}
        </div>

        {others.length ? (
          <section className="mt-16">
            <SectionHeader title={`منتجات تانية من ${storeName ?? 'المتجر'}`} href={slug ? `/brand/${slug}` : undefined} linkLabel="كل منتجات المتجر" />
            <ProductGrid products={others} />
          </section>
        ) : null}

        <div className="mt-16">
          <AppPerks compact path={path} />
        </div>
      </Container>

      <StickyOrderBar product={product} />
    </>
  );
}
