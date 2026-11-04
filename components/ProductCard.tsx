import { Package, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { discountPercent, num, originalPrice, price } from '@/lib/format';
import type { ProductCard as Product } from '@/lib/types';

import { Rating } from './Rating';
import { WishlistButton } from './WishlistButton';

/**
 * A product tile: big square photo with the discount on it, then store, title, price.
 * Wholesale products also show their lowest quantity price — that's what warehouses sell on.
 */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const off = discountPercent(product);
  const before = originalPrice(product);
  const lowestTier = product.wholesale?.tiers?.length ? product.wholesale.tiers.reduce((a, b) => (b.price < a.price ? b : a)) : null;

  // The heart sits beside the link, not inside it: a button can't live in an <a>.
  return (
    <div className="relative h-full min-w-0">
    <Link
      href={`/product/${product.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-sunken">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 48vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <Package aria-hidden className="absolute inset-0 m-auto size-10 text-ink-3" />
        )}
        <div className="absolute end-2 top-2 flex flex-col items-end gap-1">
          {off ? <span className="rounded-full bg-danger px-2 py-0.5 text-meta font-bold text-white">خصم {num(off)}٪</span> : null}
          {product.sponsored ? <span className="rounded-full bg-surface/90 px-2 py-0.5 text-meta text-ink-2">مُموَّل</span> : null}
        </div>
        {!product.inStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center text-meta font-bold text-white">خلصان دلوقتي</span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand?.name ? (
          <span className="flex min-w-0 items-center gap-1.5 text-meta text-ink-3">
            {product.brand.logoUrl ? (
              <Image src={product.brand.logoUrl} alt="" width={18} height={18} className="size-[18px] shrink-0 rounded-full object-cover" />
            ) : (
              <Store aria-hidden className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{product.brand.name}</span>
          </span>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.6em] text-ui font-semibold leading-snug text-ink transition-colors group-hover:text-accent">{product.title}</h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-body font-extrabold">{price(product.price)}</span>
          {before ? <s className="text-meta text-ink-3">{price(before)}</s> : null}
        </div>
        {lowestTier ? (
          <span className="rounded-md bg-success-soft px-2 py-1 text-meta font-semibold text-success">
            جملة من {num(lowestTier.minQty)} {product.unit ?? 'قطعة'}: {price(lowestTier.price)}
          </span>
        ) : null}
        <Rating avg={product.ratingAvg} count={product.ratingCount} />
      </div>
    </Link>
    <WishlistButton productId={product.id} title={product.title} className="absolute start-2 top-2 z-10" />
    </div>
  );
}

/** Two columns on phones, three on tablets, four at most on desktop. */
export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((p, i) => (
        <li key={p.id} className="min-w-0">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
