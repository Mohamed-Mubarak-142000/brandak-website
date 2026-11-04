import clsx from 'clsx';

import type { Variant } from '@/lib/types';

function group(variants: Variant[], key: 'size' | 'color') {
  const out = new Map<string, boolean>();
  for (const v of variants) {
    const name = v[key];
    if (!name) continue;
    out.set(name, (out.get(name) ?? false) || (v.inStock && v.available > 0));
  }
  return [...out.entries()].map(([name, inStock]) => ({ name, inStock }));
}

function Chips({ label, items }: { label: string; items: { name: string; inStock: boolean }[] }) {
  return (
    <div>
      <h3 className="text-ui font-bold">
        {label} <span className="font-normal text-ink-3">({items.filter((i) => i.inStock).length} متاح)</span>
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <li
            key={i.name}
            className={clsx(
              'inline-flex min-h-10 items-center rounded-card border px-3 text-ui',
              i.inStock ? 'border-line-strong bg-surface font-semibold' : 'border-dashed border-line text-ink-3 line-through',
            )}
          >
            {i.name}
            {!i.inStock ? <span className="sr-only"> (خلصان)</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Sizes and colours, for information only: picking one happens in the app. A size or colour is
 * dimmed when every variant carrying it is sold out.
 */
export function ProductOptions({ variants, sizeLabel, colorLabel }: { variants: Variant[]; sizeLabel?: string; colorLabel?: string }) {
  const sizes = group(variants, 'size');
  const colors = group(variants, 'color');
  if (!sizes.length && !colors.length) return null;
  return (
    <section aria-label="الاختيارات المتاحة" className="space-y-4">
      {sizes.length ? <Chips label={sizeLabel || 'المقاس'} items={sizes} /> : null}
      {colors.length ? <Chips label={colorLabel || 'اللون'} items={colors} /> : null}
      <p className="text-meta text-ink-3">بتختار المقاس واللون وانت بتطلب من التطبيق.</p>
    </section>
  );
}
