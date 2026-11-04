import { ChevronDown } from 'lucide-react';

import type { FaqItem } from '@/lib/content';

/**
 * Questions as native <details>: works without JS, keyboard and screen-reader friendly. Each
 * question is its own bordered row; where the browser supports `::details-content` the answer
 * slides open instead of snapping (plain open/close everywhere else).
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-card border border-line bg-surface transition-[border-color,box-shadow] duration-200 [interpolate-size:allow-keywords] open:border-line-strong open:shadow-card hover:border-line-strong [&::details-content]:h-0 [&::details-content]:overflow-clip [&::details-content]:transition-[height,content-visibility] [&::details-content]:duration-200 [&::details-content]:[transition-behavior:allow-discrete] [&[open]::details-content]:h-auto"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-card px-4 py-3 font-bold sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sunken text-ink-2 transition-colors group-open:bg-accent-soft group-open:text-accent">
              <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-open:rotate-180" />
            </span>
          </summary>
          <p className="max-w-[70ch] px-4 pb-5 text-ink-2 sm:px-5">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
