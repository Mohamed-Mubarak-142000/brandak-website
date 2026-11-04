import { OpenInApp } from '@/components/OpenInApp';
import { Price } from '@/components/Price';
import { appPath } from '@/lib/links';
import type { ProductCard } from '@/lib/types';

/**
 * Phones only: the price and the order button stay on screen while scrolling. It is sticky (not
 * fixed) at the end of <main>, so it parks above the footer instead of covering it, and the page
 * needs no extra bottom padding.
 */
export function StickyOrderBar({ product }: { product: ProductCard }) {
  return (
    <div className="sticky bottom-0 z-30 mt-10 border-t border-line bg-ground/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <Price product={product} className="min-w-0 flex-1" />
        <OpenInApp path={appPath.product(product.id)} className="shrink-0">
          {product.inStock ? 'اطلبه من التطبيق' : 'افتحه في التطبيق'}
        </OpenInApp>
      </div>
    </div>
  );
}
