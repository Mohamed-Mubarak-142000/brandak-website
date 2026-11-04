'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { latinDigits } from '@/components/checkout/errors';
import { cn } from '@/lib/cn';

/**
 * − [n] +. The number can be typed too (wholesale orders run into the hundreds); it is applied on
 * blur or Enter and kept within min…max. With `onRemove`, the minus turns into a bin at the minimum.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  onRemove,
  label = 'الكمية',
  size = 'md',
  block,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  onRemove?: () => void;
  label?: string;
  size?: 'sm' | 'md';
  /** Stretch to the parent's full width, the buttons at the two ends. */
  block?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));
  const commit = () => {
    if (draft === null) return;
    const n = Number(latinDigits(draft));
    setDraft(null);
    if (Number.isFinite(n) && n > 0 && clamp(n) !== value) onChange(clamp(n));
  };
  const btn = cn(
    'grid shrink-0 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:text-ink-3/60 disabled:hover:bg-transparent',
    size === 'sm' ? 'size-10' : 'size-11',
  );
  const atMin = value <= min;

  return (
    <div role="group" aria-label={label} className={cn(block ? 'flex w-full' : 'inline-flex', 'items-center rounded-full border border-line-strong bg-surface', disabled && 'opacity-60')}>
      {/* Plus sits first: in RTL that's the right-hand side, like the app. */}
      <button type="button" className={btn} onClick={() => onChange(clamp(value + 1))} disabled={disabled || value >= max} aria-label="زوّد واحد">
        <Plus aria-hidden className="size-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={draft ?? String(value)}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d٠-٩۰-۹]/g, '').slice(0, 4))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        className={cn(block ? 'min-w-0 flex-1' : 'w-12', 'bg-transparent text-center font-bold tabular-nums outline-none', size === 'sm' ? 'text-ui' : 'text-body')}
      />
      {onRemove && atMin ? (
        <button type="button" className={cn(btn, 'text-danger')} onClick={onRemove} disabled={disabled} aria-label="شيل من السلة">
          <Trash2 aria-hidden className="size-4" />
        </button>
      ) : (
        <button type="button" className={btn} onClick={() => onChange(clamp(value - 1))} disabled={disabled || atMin} aria-label="قلّل واحد">
          <Minus aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
