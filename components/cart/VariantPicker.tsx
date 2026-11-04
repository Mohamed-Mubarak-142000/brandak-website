'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { price } from '@/lib/format';
import type { Variant } from '@/lib/types';

const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))];

/**
 * The small "pick a size / colour" popover on a product card. Instead of listing every
 * size × colour combination, it shows one row of sizes and one of colours; a value that
 * doesn't exist with the other pick is dimmed, and choosing it swaps the other pick.
 */
export function VariantPicker({
  title,
  variants,
  busy,
  onAdd,
  onClose,
}: {
  title: string;
  variants: Variant[];
  busy: boolean;
  onAdd: (v: Variant) => void;
  onClose: () => void;
}) {
  const sizes = uniq(variants.map((v) => v.size));
  const colors = uniq(variants.map((v) => v.color));
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState<string | null>(colors.length === 1 ? colors[0] : null);
  const [pickedId, setPickedId] = useState<string | null>(null);

  const plain = !sizes.length && !colors.length;
  const chosen = plain
    ? variants.find((v) => v.id === pickedId)
    : variants.find((v) => (!sizes.length || v.size === size) && (!colors.length || v.color === color));

  const fitsSize = (s: string) => !color || variants.some((v) => v.size === s && v.color === color);
  const fitsColor = (c: string) => !size || variants.some((v) => v.color === c && v.size === size);

  const pickSize = (s: string) => {
    setSize(s);
    if (color && !variants.some((v) => v.size === s && v.color === color)) setColor(null);
  };
  const pickColor = (c: string) => {
    setColor(c);
    if (size && !variants.some((v) => v.color === c && v.size === size)) setSize(null);
  };

  const missing = plain ? 'اختار نوع' : sizes.length && !size ? 'اختار المقاس' : 'اختار اللون';

  return (
    <div
      role="dialog"
      aria-label={`اختار من ${title}`}
      className="absolute inset-x-0 bottom-full z-20 mb-2 rounded-panel border border-line bg-surface p-3 shadow-pop"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-ui font-bold">{plain ? 'اختار النوع' : sizes.length && colors.length ? 'اختار المقاس واللون' : sizes.length ? 'اختار المقاس' : 'اختار اللون'}</p>
        <button type="button" onClick={onClose} aria-label="اقفل" className="-m-2 grid size-9 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink">
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div className="space-y-3">
        {plain ? (
          <Group label={null}>
            {variants.map((v, i) => (
              <Chip key={v.id} selected={pickedId === v.id} onClick={() => setPickedId(v.id)}>
                {`${i + 1} · ${price(v.price)}`}
              </Chip>
            ))}
          </Group>
        ) : null}
        {sizes.length ? (
          <Group label="المقاس" value={size}>
            {sizes.map((s) => (
              <Chip key={s} selected={size === s} dim={!fitsSize(s)} onClick={() => pickSize(s)}>
                {s}
              </Chip>
            ))}
          </Group>
        ) : null}
        {colors.length ? (
          <Group label="اللون" value={color}>
            {colors.map((c) => (
              <Chip key={c} selected={color === c} dim={!fitsColor(c)} onClick={() => pickColor(c)}>
                {c}
              </Chip>
            ))}
          </Group>
        ) : null}
      </div>

      <button
        type="button"
        disabled={!chosen || busy}
        onClick={() => chosen && onAdd(chosen)}
        className="mt-3 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-3 text-ui font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-3"
      >
        {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {chosen ? 'أضف للسلة' : missing}
      </button>
    </div>
  );
}

function Group({ label, value, children }: { label: string | null; value?: string | null; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label ?? undefined}>
      {label ? (
        <p className="mb-1.5 text-meta text-ink-3">
          {label}
          {value ? <span className="font-bold text-ink">: {value}</span> : null}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  selected,
  dim,
  onClick,
  children,
}: {
  selected: boolean;
  dim?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border px-3 text-meta font-semibold transition-colors',
        selected
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-line-strong text-ink hover:border-brand hover:text-accent',
        dim && !selected && 'border-dashed text-ink-3 opacity-60',
      )}
    >
      {selected ? <Check aria-hidden className="size-3.5" /> : null}
      {children}
    </button>
  );
}
