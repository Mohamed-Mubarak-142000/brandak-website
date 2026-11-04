import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';
import { storeTypeInfo } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

/** What shoppers should expect from this kind of store, with the type's own listing rules. */
const NOTE: Record<StoreType, { title: string; body: string }> = {
  BRAND: { title: 'المقاسات والألوان', body: 'كل منتج بمقاساته وألوانه المتاحة، واختار اللون عشان تشوف صوره.' },
  SHOWROOM: { title: 'الحالة والضمان والتركيب', body: 'حالة كل موديل وضمانه، ولو التوصيل والتركيب متاحين، مكتوبين في صفحة المنتج.' },
  WAREHOUSE: { title: 'جملة وقطاعي', body: 'اشتري قطعة واحدة أو بالكمية، والسعر بيقل كل ما الكمية تزيد. افتح أي منتج عشان تشوف أسعار الكميات.' },
  SHOP: { title: 'بالقطعة أو الوزن أو العلبة', body: 'كل منتج مكتوب بيتباع إزاي، والكمية المتاحة بتتحدّث مع كل طلب.' },
};

/** Warehouses sell on quantity prices, so their panel stands out. */
export function StoreTypePanel({ type }: { type: StoreType }) {
  const info = storeTypeInfo(type);
  const note = NOTE[info.type];
  const loud = info.type === 'WAREHOUSE';
  const Icon = info.icon;
  return (
    <section aria-labelledby="type-note" className={cn('rounded-panel p-5', loud ? 'border-2 border-success bg-success-soft' : 'border border-line bg-sunken')}>
      <h2 id="type-note" className={cn('flex items-center gap-2 font-extrabold', loud ? 'text-section text-success' : 'text-body')}>
        <Icon aria-hidden className={cn('size-5 shrink-0', loud ? 'text-success' : 'text-accent')} />
        {note.title}
      </h2>
      <p className="mt-1.5 text-ui text-ink-2">{note.body}</p>
      <ul className="mt-3 space-y-2">
        {info.system.map((line) => (
          <li key={line} className="flex gap-2 text-ui">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
