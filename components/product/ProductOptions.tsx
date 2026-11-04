'use client';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';
import type { ProductDetail } from '@/lib/types';

import { swatch } from './colors';
import { OPTIONS_ID, setPurchase, usePurchase } from './purchase';

function Group({
  label,
  items,
  value,
  onPick,
  ever,
  withOther,
  colors,
  missing,
}: {
  label: string;
  items: string[];
  value: string | null;
  onPick: (v: string) => void;
  ever: (v: string) => boolean;
  withOther: (v: string) => boolean;
  colors?: boolean;
  missing: boolean;
}) {
  const available = items.filter(ever).length;
  const flagged = missing && !value;
  return (
    <fieldset>
      <legend className={cn('text-ui font-bold', flagged && 'text-danger')}>
        {label}: <span className={cn('font-semibold', flagged ? 'text-danger' : value ? 'text-ink' : 'text-ink-3')}>{value ?? `اختار ${label}`}</span>
        <span className="ms-1.5 text-meta font-normal text-ink-3">
          ({num(available)} {available === items.length ? 'متاح' : `متاح من ${num(items.length)}`})
        </span>
      </legend>
      <div role="radiogroup" aria-label={label} aria-invalid={flagged || undefined} className="mt-2 flex flex-wrap gap-2">
        {items.map((name) => {
          const hex = colors ? swatch(name) : null;
          const out = !ever(name);
          const elsewhere = !out && !withOther(name);
          const on = value === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={out}
              onClick={() => onPick(name)}
              aria-label={out ? `${name} (خلصان)` : elsewhere ? `${name} (مش متاح مع اختيارك التاني)` : name}
              className={cn(
                'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-card border px-3 text-ui transition-colors',
                on ? 'border-accent bg-accent-soft font-bold text-accent ring-1 ring-accent' : 'border-line-strong bg-surface font-semibold text-ink hover:border-brand',
                elsewhere && !on && 'border-dashed text-ink-3',
                out && 'cursor-not-allowed border-dashed border-line bg-sunken font-normal text-ink-3 line-through hover:border-line',
              )}
            >
              {hex ? <span aria-hidden className={cn('size-4 shrink-0 rounded-full border border-black/15', out && 'opacity-40')} style={{ background: hex }} /> : null}
              {name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Size and colour pickers. A choice sold out in every variant is disabled; one sold out only with
 * the other current choice can still be picked, and clears that other choice.
 */
export function ProductOptions({ product }: { product: ProductDetail }) {
  const p = usePurchase(product);
  if (!p.sizes.length && !p.colors.length) return null;
  if (product.variants.length === 1) return null;
  const sizeLabel = product.sizeLabel || 'المقاس';
  const colorLabel = product.colorLabel || 'اللون';
  const ok = (size: string | null, color: string | null) => {
    const v = p.match(size, color);
    return !!v && v.inStock && v.available > 0;
  };

  return (
    <section id={OPTIONS_ID} aria-label="اختار" className="scroll-mt-48 space-y-4">
      {p.colors.length ? (
        <Group
          label={colorLabel}
          items={p.colors}
          value={p.state.color}
          colors
          missing={p.state.missing}
          ever={p.colorEver}
          withOther={p.colorWith}
          onPick={(c) => setPurchase(product.id, { color: c, size: p.state.size && p.sizes.length && !ok(p.state.size, c) ? null : p.state.size, missing: false, error: null, qty: null })}
        />
      ) : null}
      {p.sizes.length ? (
        <Group
          label={sizeLabel}
          items={p.sizes}
          value={p.state.size}
          missing={p.state.missing}
          ever={p.sizeEver}
          withOther={p.sizeWith}
          onPick={(s) => setPurchase(product.id, { size: s, color: p.state.color && p.colors.length && !ok(s, p.state.color) ? null : p.state.color, missing: false, error: null, qty: null })}
        />
      ) : null}
      {p.state.missing ? (
        <p role="alert" className="text-ui font-semibold text-danger">
          اختار {[p.colors.length && !p.state.color ? colorLabel : null, p.sizes.length && !p.state.size ? sizeLabel : null].filter(Boolean).join(' و')} الأول.
        </p>
      ) : null}
    </section>
  );
}
