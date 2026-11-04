'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

/** Small controls shared by the product form and the assistant settings. */

export function Switch({ checked, onChange, label, disabled, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-accent' : 'bg-line-strong',
      )}
    >
      <span aria-hidden className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start]', checked ? 'inset-s-6' : 'inset-s-1')} />
    </button>
  );
}

/** A row with a title, a note and a switch. */
export function ToggleRow({ title, note, checked, onChange, disabled, active }: { title: string; note?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; active?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-card border bg-surface p-3.5', active ?? checked ? 'border-brand' : 'border-line')}>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        {note ? <p className="text-meta text-ink-3">{note}</p> : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

export function Chip({ selected, onClick, children, swatch, role = 'checkbox' }: { selected: boolean; onClick: () => void; children: React.ReactNode; swatch?: string | null; role?: 'checkbox' | 'radio' }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-ui transition-colors',
        selected ? 'border-brand bg-accent-soft font-bold text-accent' : 'border-line-strong bg-surface text-ink hover:border-ink-3',
      )}
    >
      {swatch ? <span aria-hidden className="size-4 rounded-full border border-line-strong" style={{ backgroundColor: swatch }} /> : null}
      {selected && !swatch ? <Check aria-hidden className="size-3.5" /> : null}
      {children}
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-card bg-skeleton', className)} />;
}
