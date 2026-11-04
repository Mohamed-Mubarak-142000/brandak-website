import { Ruler } from 'lucide-react';

import { plainText } from '@/lib/format';
import type { ProductDetail, StoreType } from '@/lib/types';

import { KeyFacts, pickFacts, type Fact } from './Specs';
import { WholesaleTable } from './WholesaleTable';

/**
 * The part of the product page that depends on who sells it: quantity prices for warehouses, the
 * model/condition/warranty for showrooms, unit/size/expiry for shops, and the size guide for brands.
 */
export function StoreTypeDetails({ product, storeType }: { product: ProductDetail; storeType: StoreType }) {
  const specs = product.specs ?? [];
  const unit = product.unit || 'قطعة';
  const sizes = [...new Set(product.variants.map((v) => v.size).filter((s): s is string => !!s))];

  let facts: Fact[] = [];
  if (storeType === 'SHOWROOM') {
    facts = pickFacts(specs, ['condition', 'warranty', 'brand', 'model', 'year', 'km']);
  } else if (storeType === 'SHOP') {
    facts = [
      { label: 'الوحدة', value: unit },
      ...(sizes.length === 1 ? [{ label: product.sizeLabel || 'الحجم', value: sizes[0] }] : []),
      ...pickFacts(specs, ['brand', 'shelf_life', 'origin', 'flavor']),
    ];
  } else if (storeType === 'WAREHOUSE') {
    facts = pickFacts(specs, ['brand', 'origin', 'pieces']);
  }

  const showWholesale = !!product.wholesale && (storeType === 'WAREHOUSE' || product.wholesale.tiers?.length > 0 || product.wholesale.minQty > 1);
  const sizeGuide = product.sizeGuide?.trim();

  if (!facts.length && !showWholesale && !sizeGuide) return null;

  return (
    <div className="space-y-4">
      <KeyFacts facts={facts} />
      {showWholesale && product.wholesale ? <WholesaleTable wholesale={product.wholesale} basePrice={product.price} unit={unit} /> : null}
      {sizeGuide ? (
        <details className="group rounded-panel border border-line bg-surface">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-ui font-bold [&::-webkit-details-marker]:hidden">
            <Ruler aria-hidden className="size-4 text-accent" />
            دليل المقاسات
            <span className="ms-auto text-meta font-normal text-ink-3 group-open:hidden">اضغط وشوف</span>
          </summary>
          <p className="whitespace-pre-line border-t border-line px-4 py-3 text-ui text-ink-2">{plainText(sizeGuide)}</p>
        </details>
      ) : null}
    </div>
  );
}
