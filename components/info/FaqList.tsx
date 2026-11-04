import { ChevronDown } from 'lucide-react';

import type { FaqItem } from '@/lib/content';

/** Questions as native <details>: works without JS, keyboard and screen-reader friendly. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line rounded-panel border border-line bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-bold sm:px-5 [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown aria-hidden className="size-5 shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-180" />
          </summary>
          <p className="max-w-[70ch] px-4 pb-4 text-ink-2 sm:px-5">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
