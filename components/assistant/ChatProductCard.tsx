import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { originalPrice, price } from '@/lib/format';
import type { ProductCard } from '@/lib/types';

/** A small product tile for the chat's horizontal row: photo, title, price, "شوف المنتج". */
export function ChatProductCard({ product }: { product: ProductCard }) {
  const before = originalPrice(product);
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card"
    >
      <span className="relative block aspect-square bg-sunken">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt="" fill sizes="144px" className="object-cover" />
        ) : (
          <Package aria-hidden className="absolute inset-0 m-auto size-8 text-ink-3" />
        )}
        {!product.inStock ? <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-meta font-bold text-white">خلصان دلوقتي</span> : null}
      </span>
      <span className="flex flex-1 flex-col gap-1 p-2.5">
        <span className="line-clamp-2 text-meta font-semibold leading-snug text-ink group-hover:text-accent">{product.title}</span>
        <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-ui font-extrabold">{price(product.price)}</span>
          {before ? <s className="text-meta text-ink-3">{price(before)}</s> : null}
        </span>
        <span className="text-meta font-bold text-accent underline-offset-4 group-hover:underline">شوف المنتج</span>
      </span>
    </Link>
  );
}
