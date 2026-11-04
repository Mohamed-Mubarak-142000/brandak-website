import { Info } from 'lucide-react';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';
import type { Variant } from '@/lib/types';

import { swatch } from './colors';

function group(variants: Variant[], key: 'size' | 'color') {
  const out = new Map<string, boolean>();
  for (const v of variants) {
    const name = v[key];
    if (!name) continue;
    out.set(name, (out.get(name) ?? false) || (v.inStock && v.available > 0));
  }
  return [...out.entries()].map(([name, inStock]) => ({ name, inStock }));
}

function Chips({ label, items, colors }: { label: string; items: { name: string; inStock: boolean }[]; colors?: boolean }) {
  const available = items.filter((i) => i.inStock).length;
  return (
    <div>
      <h3 className="text-ui font-bold">
        {label}
        <span className="ms-1.5 font-normal text-ink-3">
          ({num(available)} {available === items.length ? 'متاح' : `متاح من ${num(items.length)}`})
        </span>
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => {
          const hex = colors ? swatch(i.name) : null;
          return (
            <li
              key={i.name}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-card border px-3 text-ui',
                i.inStock ? 'border-line-strong bg-surface font-semibold text-ink' : 'border-dashed border-line bg-sunken text-ink-3 line-through',
              )}
            >
              {hex ? <span aria-hidden className={cn('size-4 shrink-0 rounded-full border border-black/15', !i.inStock && 'opacity-40')} style={{ background: hex }} /> : null}
              {i.name}
              {!i.inStock ? <span className="sr-only"> (خلصان)</span> : null}
            </li>
          );
        })}
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
      {colors.length ? <Chips label={colorLabel || 'اللون'} items={colors} colors /> : null}
      {sizes.length ? <Chips label={sizeLabel || 'المقاس'} items={sizes} /> : null}
      <p className="flex items-center gap-1.5 text-meta text-ink-3">
        <Info aria-hidden className="size-3.5 shrink-0" />
        بتختار {[colors.length ? 'اللون' : null, sizes.length ? 'المقاس' : null].filter(Boolean).join(' و')} وانت بتطلب من التطبيق.
      </p>
    </section>
  );
}
