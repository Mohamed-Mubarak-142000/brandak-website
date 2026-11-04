import clsx from 'clsx';

import { discountPercent, originalPrice, price } from '@/lib/format';
import type { ProductCard } from '@/lib/types';

/** Current price, the crossed-out old one and the discount badge, as on the app's product card. */
export function Price({ product, size = 'md', className }: { product: Pick<ProductCard, 'price' | 'compareAtPrice' | 'sale'>; size?: 'md' | 'lg'; className?: string }) {
  const off = discountPercent(product);
  const before = originalPrice(product);
  return (
    <div className={clsx('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={clsx('font-bold text-ink', size === 'lg' ? 'text-page' : 'text-body')}>{price(product.price)}</span>
      {before ? <s className="text-meta text-ink-3">{price(before)}</s> : null}
      {off ? <span className="rounded-full bg-danger-soft px-2 py-0.5 text-meta font-bold text-danger">-{off}٪</span> : null}
    </div>
  );
}
