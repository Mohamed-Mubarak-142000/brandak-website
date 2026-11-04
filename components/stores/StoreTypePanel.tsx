import clsx from 'clsx';
import { Check } from 'lucide-react';

import { storeTypeInfo } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

/** What shoppers should expect from this kind of store, with the type's own listing rules. */
const NOTE: Record<StoreType, { title: string; body: string }> = {
  BRAND: { title: 'المقاسات والألوان', body: 'كل منتج بمقاساته وألوانه المتاحة، واختار اللون عشان تشوف صوره.' },
  SHOWROOM: { title: 'الحالة والضمان والتركيب', body: 'حالة كل موديل وضمانه، ولو التوصيل والتركيب متاحين، مكتوبين في صفحة المنتج نفسه.' },
  WAREHOUSE: { title: 'جملة وقطاعي', body: 'تقدر تشتري قطعة واحدة أو بالكمية، والسعر بيقل كل ما الكمية تزيد. افتح أي منتج عشان تشوف أسعار الكميات بتاعته.' },
  SHOP: { title: 'بالقطعة أو الوزن أو العلبة', body: 'كل منتج مكتوب بيتباع إزاي، والكمية المتاحة بتتحدّث مع كل طلب.' },
};

export function StoreTypePanel({ type }: { type: StoreType }) {
  const info = storeTypeInfo(type);
  const note = NOTE[info.type];
  const loud = info.type === 'WAREHOUSE';
  return (
    <section
      aria-labelledby="type-note"
      className={clsx('rounded-panel p-5', loud ? 'border-2 border-success bg-success-soft sm:p-6' : 'border border-line bg-sunken')}
    >
      <h2 id="type-note" className={clsx('font-extrabold', loud ? 'text-section text-success' : 'text-body')}>
        {note.title}
      </h2>
      <p className="mt-1 text-ui text-ink-2">{note.body}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
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
