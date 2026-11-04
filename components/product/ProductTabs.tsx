'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

export interface ProductTab {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

/**
 * In-page tabs (WAI-ARIA tabs pattern). Every panel is server-rendered and stays in the HTML, the
 * inactive ones `hidden`. Arrow keys follow the reading direction (RTL: ← is next). A link to
 * `#<tab id>` (e.g. the rating next to the price → #reviews) opens that tab and scrolls to it.
 */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!tabs.some((t) => t.id === id)) return;
      setActive(id);
      requestAnimationFrame(() => root.current?.scrollIntoView({ block: 'start' }));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [tabs]);

  if (!tabs.length) return null;

  const select = (i: number) => {
    const t = tabs[(i + tabs.length) % tabs.length];
    setActive(t.id);
    buttons.current[(i + tabs.length) % tabs.length]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    if (e.key === 'ArrowLeft') select(rtl ? i + 1 : i - 1);
    else if (e.key === 'ArrowRight') select(rtl ? i - 1 : i + 1);
    else if (e.key === 'Home') select(0);
    else if (e.key === 'End') select(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className="scroll-mt-32 lg:scroll-mt-48">
      <div role="tablist" aria-label="تفاصيل المنتج" className="rail -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'relative -mb-px inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-4 text-ui font-bold transition-colors sm:text-body',
                on ? 'border-brand text-ink' : 'border-transparent text-ink-3 hover:text-ink',
              )}
            >
              {t.label}
              {t.count ? <span className={cn('rounded-full px-2 py-0.5 text-meta', on ? 'bg-accent-soft text-accent' : 'bg-sunken text-ink-3')}>{num(t.count)}</span> : null}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} tabIndex={0} hidden={t.id !== active} className="pt-6 focus-visible:outline-offset-4 sm:pt-8">
          {t.content}
        </div>
      ))}
    </div>
  );
}
