import { Price } from '@/components/Price';
import { OpenInApp } from '@/components/OpenInApp';
import { appPath } from '@/lib/links';
import type { ProductCard } from '@/lib/types';

/**
 * Phones and tablets: the price and the order button stay on screen while scrolling. It is sticky
 * (not fixed) at the end of <main>, so it parks above the footer instead of covering it, and the
 * page needs no extra bottom padding.
 */
export function StickyOrderBar({ product }: { product: ProductCard }) {
  return (
    <div className="sticky bottom-0 z-30 mt-12 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(29_26_24/0.25)] lg:hidden">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <Price product={product} />
          {!product.inStock ? <p className="text-meta font-semibold text-danger">خلصان دلوقتي</p> : null}
        </div>
        <OpenInApp path={appPath.product(product.id)} className="min-h-12 shrink-0 px-6">
          {product.inStock ? 'اطلبه من التطبيق' : 'افتحه في التطبيق'}
        </OpenInApp>
      </div>
    </div>
  );
}
