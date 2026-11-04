import { Banknote, CalendarClock, CircleCheck, CircleX, RotateCcw, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import Link from 'next/link';

import { OpenInApp } from '@/components/OpenInApp';
import { Rating } from '@/components/Rating';
import { StoreLogo } from '@/components/StoreCard';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { date, discountPercent, num, originalPrice, price } from '@/lib/format';
import { appPath } from '@/lib/links';
import type { ProductDetail, PublicBrand, StoreType } from '@/lib/types';

import { deliverySummary } from './DeliveryInfo';
import { ProductOptions } from './ProductOptions';
import { StoreTypeDetails } from './StoreTypeDetails';

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

/**
 * Everything needed to decide, next to the photos: store, title, price, stock, options, the
 * store-type specific part, and the one action — order in the app.
 */
export function PurchaseCard({ product, store, storeType }: { product: ProductDetail; store: PublicBrand | null; storeType: StoreType }) {
  const slug = product.brand.slug;
  const storeName = store?.name ?? product.brand.name;
  const storeLogo = store?.logoUrl ?? product.brand.logoUrl ?? null;
  const off = discountPercent(product);
  const before = originalPrice(product);
  // The API only attaches a sale while it runs.
  const saleEnds = product.sale?.endsAt ?? null;
  const trust = deliverySummary(store);

  return (
    <div className="space-y-6 lg:rounded-panel lg:border lg:border-line lg:bg-surface lg:p-6 lg:shadow-card">
      <div className="space-y-3">
        {storeName ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={slug ? `/brand/${slug}` : '/stores'} className="group inline-flex min-h-11 min-w-0 items-center gap-2.5">
              <StoreLogo store={{ name: storeName, logoUrl: storeLogo }} size={40} />
              <span className="min-w-0">
                <span className="block truncate text-ui font-extrabold transition-colors group-hover:text-accent">{storeName}</span>
                <span className="block text-meta text-ink-3">زور المتجر</span>
              </span>
            </Link>
            <StoreTypeBadge type={storeType} />
          </div>
        ) : null}

        <h1 className="text-section font-extrabold leading-snug sm:text-page">{product.title}</h1>
        {product.ratingCount > 0 ? (
          <a href="#reviews" className="inline-flex min-h-8 items-center gap-2 hover:underline">
            <Rating avg={product.ratingAvg} count={product.ratingCount} className="text-ui" />
            <span className="text-meta text-ink-3">شوف التقييمات</span>
          </a>
        ) : null}
      </div>

      <div className="space-y-3 border-y border-line py-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-page font-extrabold leading-none sm:text-[2rem]">{price(product.price)}</span>
          {before ? (
            <s className="text-body text-ink-3">
              <span className="sr-only">بدل </span>
              {price(before)}
            </s>
          ) : null}
          {off ? <span className="rounded-full bg-danger px-2.5 py-0.5 text-meta font-bold text-white">خصم {num(off)}٪</span> : null}
        </div>
        {before ? <p className="text-meta font-semibold text-success">هتوفّر {price(before - product.price)}</p> : null}
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

      <div>
        <OpenInApp path={appPath.product(product.id)} className="min-h-14 w-full text-body">
          <Smartphone aria-hidden className="size-5" />
          {product.inStock ? 'اطلبه من التطبيق' : 'افتحه في التطبيق'}
        </OpenInApp>
        <p className="mt-2.5 text-center text-meta text-ink-3">
          {product.inStock ? 'السلة والكوبونات والنقاط في التطبيق.' : 'تابع المتجر من التطبيق ويوصلك الجديد. السلة والكوبونات والنقاط في التطبيق.'}
        </p>
      </div>

      <ul className="divide-y divide-line rounded-card bg-sunken px-4">
        <li className="flex min-h-12 items-center gap-3 py-2.5 text-ui">
          <Banknote aria-hidden className="size-5 shrink-0 text-ink-2" />
          <span>
            <strong className="font-bold">الدفع عند الاستلام</strong>
            <span className="text-ink-2">، كاش لما الطلب يوصلك</span>
          </span>
        </li>
        <li className="flex min-h-12 items-center gap-3 py-2.5 text-ui">
          <Truck aria-hidden className="size-5 shrink-0 text-ink-2" />
          <span>
            <strong className="font-bold">{trust.delivery}</strong>
            {trust.free ? <span className="text-ink-2">، {trust.free}</span> : null}
          </span>
        </li>
        <li className="flex min-h-12 items-center gap-3 py-2.5 text-ui">
          {trust.returns ? <RotateCcw aria-hidden className="size-5 shrink-0 text-ink-2" /> : <ShieldCheck aria-hidden className="size-5 shrink-0 text-ink-2" />}
          <strong className="font-bold">{trust.returns ?? 'كل التقييمات من ناس استلمت فعلًا'}</strong>
        </li>
      </ul>
    </div>
  );
}
