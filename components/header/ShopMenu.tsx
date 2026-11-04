'use client';

import { ChevronDown, LayoutGrid, Percent } from 'lucide-react';
import Link from 'next/link';
import { useId, useRef } from 'react';

import { Container } from '@/components/Container';
import { categoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/cn';
import { STORE_TYPES } from '@/lib/store-types';

import { useDismiss } from './useDismiss';

export interface MenuSection {
  id: string;
  name: string;
  icon?: string;
}

/**
 * "تسوّق": the desktop mega menu — the four store types on one side, the top-level sections on the
 * other. Opens on click (and on hover for mouse users), closes on outside click, Escape, picking a
 * link, or a page change.
 */
export function ShopMenu({ sections }: { sections: MenuSection[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useDismiss(wrap, button);
  const panelId = useId();
  const hover = useRef<ReturnType<typeof setTimeout>>(undefined);

  const later = (next: boolean, ms: number) => {
    clearTimeout(hover.current);
    hover.current = setTimeout(() => setOpen(next), ms);
  };
  const close = () => setOpen(false);

  return (
    <div
      ref={wrap}
      onPointerEnter={(e) => e.pointerType === 'mouse' && later(true, 120)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && later(false, 180)}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clearTimeout(hover.current);
          setOpen(!open);
        }}
        className={cn(
          'flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 font-bold transition-colors',
          open ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent hover:bg-accent hover:text-on-accent',
        )}
      >
        <LayoutGrid aria-hidden className="size-4" />
        تسوّق
        <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-t border-line bg-surface shadow-pop"
      >
        <Container className="grid gap-8 py-7 lg:grid-cols-[19rem_1fr]">
          <div>
            <p className="mb-3 text-ui font-bold text-ink-3">حسب نوع المتجر</p>
            <ul className="space-y-1">
              {STORE_TYPES.map(({ type, plural, description, icon: Icon, path }) => (
                <li key={type}>
                  <Link href={path} onClick={close} className="group flex items-center gap-3 rounded-card p-2.5 transition-colors hover:bg-sunken">
                    <span className="grid size-11 shrink-0 place-items-center rounded-card bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{plural}</span>
                      <span className="block truncate text-meta text-ink-3">{description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/stores" onClick={close} className="mt-3 inline-flex min-h-11 items-center px-2.5 text-ui font-bold text-accent hover:underline">
              كل المتاجر
            </Link>
          </div>

          <div className="border-line lg:border-s lg:ps-8">
            <p className="mb-3 text-ui font-bold text-ink-3">الأقسام</p>
            {sections.length ? (
              <ul className="grid grid-cols-2 gap-1 md:grid-cols-3 xl:grid-cols-4">
                {sections.map((s) => {
                  const Icon = categoryIcon(s.icon);
                  return (
                    <li key={s.id}>
                      <Link href={`/category/${s.id}`} onClick={close} className="flex min-h-11 items-center gap-2.5 rounded-card px-2.5 py-2 text-ui font-semibold transition-colors hover:bg-sunken hover:text-accent">
                        <Icon aria-hidden className="size-4 shrink-0 text-ink-3" />
                        <span className="truncate">{s.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-ui text-ink-3">الأقسام مش متاحة دلوقتي.</p>
            )}
            <Link
              href="/offers"
              onClick={close}
              className="mt-5 flex items-center gap-3 rounded-panel bg-accent-soft px-4 py-3 transition-colors hover:bg-accent hover:text-on-accent"
            >
              <Percent aria-hidden className="size-5" />
              <span className="font-bold">العروض والخصومات</span>
              <span className="text-ui opacity-80">منتجات عليها خصم دلوقتي</span>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}
