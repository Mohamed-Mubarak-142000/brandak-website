import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppPerks } from '@/components/AppPerks';
import { Breadcrumbs, type Crumb } from '@/components/catalog/Breadcrumbs';
import { Container } from '@/components/Container';
import { DeliveryInfo } from '@/components/product/DeliveryInfo';
import { Gallery } from '@/components/product/Gallery';
import { ProductTabs, type ProductTab } from '@/components/product/ProductTabs';
import { PurchaseCard } from '@/components/product/PurchaseCard';
import { Reviews } from '@/components/product/Reviews';
import { specRows, SpecsTable } from '@/components/product/Specs';
import { StickyOrderBar } from '@/components/product/StickyOrderBar';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { getBrand, getBrandProducts, getCategories, getProduct, getReviews } from '@/lib/api';
import { excerpt, plainText } from '@/lib/format';
import { appPath, SITE_URL } from '@/lib/links';
import { storeTypeInfo } from '@/lib/store-types';
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

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const slug = product.brand.slug;
  const [store, reviews, more, categories] = await Promise.all([
    slug ? getBrand(slug) : Promise.resolve(null),
    getReviews(product.id, 3),
    slug ? getBrandProducts(slug, { limit: 11 }) : Promise.resolve({ items: [] }),
    getCategories(),
  ]);

  const storeType = store?.storeType ?? 'BRAND';
  const others = more.items.filter((p) => p.id !== product.id).slice(0, 10);
  const images = product.images.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const imageColors = product.images.length ? product.imageColors : undefined;
  const description = plainText(product.description ?? '');
  const storeName = store?.name ?? product.brand.name;
  const path = appPath.product(product.id);
  const trail = crumbs(product, categories);
  const leaf = trail.length > 1 ? trail[trail.length - 1] : null;

  const tabs: ProductTab[] = [];
  tabs.push({
    id: 'description',
    label: 'الوصف',
    content: (
      <div className="max-w-3xl">
        {description ? (
          <p className="whitespace-pre-line text-body leading-loose text-ink-2">{description}</p>
        ) : (
          <p className="text-body text-ink-3">المتجر لسه مكتبش وصف للمنتج ده. شوف الصور والمواصفات، أو اسأل المتجر من التطبيق.</p>
        )}
        {product.tags.length ? (
          <div className="mt-6">
            <h3 className="text-ui font-bold text-ink-2">دوّر على حاجات شبهه</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {product.tags.slice(0, 10).map((t) => (
                <li key={t}>
                  <Link
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-meta font-semibold text-ink-2 transition-colors hover:border-brand hover:text-ink"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    ),
  });

  const specExtra = [
    ...(leaf ? [{ label: 'القسم', value: leaf.label }] : []),
    ...(product.unit ? [{ label: 'الوحدة', value: product.unit }] : []),
    { label: 'نوع المتجر', value: storeTypeInfo(storeType).label },
  ];
  if (specRows(product.specs ?? []).length) {
    tabs.push({ id: 'specs', label: 'المواصفات', content: <div className="max-w-3xl"><SpecsTable specs={product.specs ?? []} extra={specExtra} /></div> });
  }
  if (store?.shipping) {
    tabs.push({ id: 'delivery', label: 'التوصيل والترجيع', content: <div className="max-w-4xl"><DeliveryInfo store={store} /></div> });
  }
  tabs.push({
    id: 'reviews',
    label: 'التقييمات',
    count: reviews.total,
    content: <Reviews productId={product.id} items={reviews.items} total={reviews.total} stars={reviews.stars} avg={product.ratingAvg} />,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product) }} />

      <Container className="pt-4 sm:pt-6">
        <Breadcrumbs items={trail} />

        <div className="mt-4 grid gap-6 sm:mt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          <Gallery images={images} imageColors={imageColors} title={product.title} colorLabel={product.colorLabel} />
          <div className="min-w-0 lg:sticky lg:top-44 lg:self-start">
            <PurchaseCard product={product} store={store} storeType={storeType} />
          </div>
        </div>

        <section aria-label="تفاصيل المنتج" className="mt-12 sm:mt-16">
          <ProductTabs tabs={tabs} />
        </section>

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

      <StickyOrderBar product={product} acceptsOrders={store?.shipping?.acceptsOrders ?? true} />
    </>
  );
}
