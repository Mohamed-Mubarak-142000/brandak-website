'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { useDismiss } from '@/components/header/useDismiss';
import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

/**
 * Phones and tablets: a "الفلاتر" button that slides the filter form in from the side. The form
 * itself is server-rendered and passed as children, so it still works as a plain GET form.
 */
export function FilterDrawer({ count, children }: { count: number; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useDismiss(panel, button);

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold transition-colors hover:border-brand lg:hidden"
      >
        <SlidersHorizontal aria-hidden className="size-4" />
        الفلاتر
        {count ? <span className="grid size-5 place-items-center rounded-full bg-accent text-meta text-on-accent">{num(count)}</span> : null}
      </button>

      <div className={cn('fixed inset-0 z-50 overflow-hidden lg:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
        <div className={cn('absolute inset-0 bg-ink/40 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-drawer-title"
          onSubmit={() => setOpen(false)}
          className={cn(
            'absolute inset-y-0 inset-e-0 flex w-[88%] max-w-sm flex-col bg-surface shadow-pop transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line ps-5 pe-3">
            <h2 id="filters-drawer-title" className="text-body font-extrabold">
              الفلاتر
            </h2>
            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="اقفل الفلاتر"
              className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sunken"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </>
  );
}
