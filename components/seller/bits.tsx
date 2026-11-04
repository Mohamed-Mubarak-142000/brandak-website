import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';
import type { BrandStatus } from '@/lib/types';

/** Small pieces shared by the store-owner pages. Safe in server and client components. */

export const BRAND_STATUS: Record<BrandStatus, { label: string; tone: string }> = {
  PENDING_REVIEW: { label: 'تحت المراجعة', tone: 'bg-warning-soft text-warning' },
  ACTIVE: { label: 'شغّال', tone: 'bg-success-soft text-success' },
  REJECTED: { label: 'محتاج تعديل', tone: 'bg-danger-soft text-danger' },
  SUSPENDED: { label: 'موقوف', tone: 'bg-danger-soft text-danger' },
};

export function BrandStatusPill({ status, className }: { status: BrandStatus; className?: string }) {
  const s = BRAND_STATUS[status];
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-meta font-bold', s.tone, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

/** +12% / -4% against the previous period of the same length. */
export function Change({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return null;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn('inline-flex items-center gap-1 text-meta font-semibold', up ? 'text-success' : 'text-danger')}>
      <Icon aria-hidden className="size-3.5" />
      <bdi>
        {up ? '+' : '-'}
        {num(Math.abs(Math.round(pct)))}٪
      </bdi>
      <span className="font-normal text-ink-3">عن الفترة اللي قبلها</span>
    </span>
  );
}

/** A labelled switch row (checkbox with role="switch"). */
export function Toggle({
  title,
  body,
  checked,
  disabled,
  onChange,
  className,
}: {
  title: string;
  body?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 rounded-card border p-3.5 has-focus-visible:outline-2 has-focus-visible:outline-brand',
        checked ? 'border-brand' : 'border-line',
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-ui font-bold">{title}</span>
        {body ? <span className="block text-meta text-ink-2">{body}</span> : null}
      </span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-line-strong')}>
        <span className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start]', checked ? 'start-6' : 'start-1')} />
      </span>
    </label>
  );
}

/** Selectable pill (radio-like). */
export function ChoiceChip({ selected, onClick, children, disabled }: { selected: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 text-ui font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        selected ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong bg-surface text-ink-2 hover:border-brand',
      )}
    >
      {children}
    </button>
  );
}

export const textareaClass =
  'min-h-28 w-full rounded-card border border-line-strong bg-surface px-3.5 py-3 text-body text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-sunken aria-invalid:border-danger';
