import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { num, price } from '@/lib/format';
import type { ProductCard as Product } from '@/lib/types';

import { Price } from './Price';
import { Rating } from './Rating';

/** A product tile. Wholesale products show their lowest quantity price; that's what warehouses sell on. */
export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const lowestTier = product.wholesale?.tiers?.length ? product.wholesale.tiers.reduce((a, b) => (b.price < a.price ? b : a)) : null;
  return (
    <Link href={`/product/${product.id}`} className="group flex min-w-0 flex-col">
      <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-sunken">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 46vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <Package aria-hidden className="absolute inset-0 m-auto size-10 text-ink-3" />
        )}
        {!product.inStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-meta font-bold text-ground">خلصان دلوقتي</span>
        ) : null}
        {product.sponsored ? <span className="absolute start-2 top-2 rounded-full bg-surface/90 px-2 text-meta text-ink-2">مُموَّل</span> : null}
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1">
        {product.brand?.name ? <span className="truncate text-meta text-ink-3">{product.brand.name}</span> : null}
        <h3 className="line-clamp-2 text-ui font-semibold leading-snug group-hover:text-accent">{product.title}</h3>
        <Price product={product} className="mt-auto pt-1" />
        {lowestTier ? (
          <span className="text-meta font-semibold text-success">
            جملة من {num(lowestTier.minQty)} {product.unit ?? 'قطعة'}: {price(lowestTier.price)}
          </span>
        ) : null}
        <Rating avg={product.ratingAvg} count={product.ratingCount} />
      </div>
    </Link>
  );
}

/** Two columns on phones, up to five on desktop. */
export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
      {products.map((p, i) => (
        <li key={p.id} className="min-w-0">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
