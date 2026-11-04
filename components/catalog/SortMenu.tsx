'use client';

import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

/**
 * "رتّب حسب" as a <details> dropdown of plain links, so it works without JavaScript; with it, the
 * menu also closes on an outside click, Escape, or after picking.
 */
export function SortMenu({ options, current }: { options: { label: string; href: string; value: string }[]; current: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const label = options.find((o) => o.value === current)?.label ?? options[0]?.label;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPointer = (e: PointerEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && el.open) {
        el.open = false;
        el.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong bg-surface ps-4 pe-3 text-ui transition-colors hover:border-brand [&::-webkit-details-marker]:hidden">
        <ArrowUpDown aria-hidden className="size-4 text-ink-3" />
        <span className="text-ink-3 max-sm:sr-only">رتّب حسب:</span>
        <span className="font-bold">{label}</span>
        <ChevronDown aria-hidden className="size-4 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute inset-e-0 top-full z-20 mt-2 w-56 rounded-card border border-line bg-surface p-1.5 shadow-pop" aria-label="الترتيب">
        {options.map((o) => {
          const on = o.value === current;
          return (
            <li key={o.value}>
              <Link
                href={o.href}
                aria-current={on ? 'true' : undefined}
                onClick={() => {
                  if (ref.current) ref.current.open = false;
                }}
                className={cn(
                  'flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-ui transition-colors hover:bg-sunken',
                  on ? 'font-bold text-accent' : 'text-ink-2',
                )}
              >
                {o.label}
                {on ? <Check aria-hidden className="size-4" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
