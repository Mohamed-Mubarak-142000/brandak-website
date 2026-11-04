'use client';

import { ChevronDown, Menu, Percent, Store, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { OpenInApp } from '@/components/OpenInApp';
import { categoryIcon } from '@/lib/category-icons';
import { cn } from '@/lib/cn';
import { STORE_TYPES } from '@/lib/store-types';

import type { MenuSection } from './ShopMenu';
import { useDismiss } from './useDismiss';

const noop = () => () => {};

/**
 * Phones: a side drawer with store types, sections and links. Locks page scroll while open.
 * Rendered into <body>: the header's backdrop blur would otherwise trap `position: fixed` inside it.
 */
export function MobileMenu({ sections }: { sections: MenuSection[] }) {
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useDismiss(panel, button);
  const [allSections, setAllSections] = useState(false);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);

  const shown = allSections ? sections : sections.slice(0, 8);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label="القائمة"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ms-2 grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sunken md:hidden"
      >
        <Menu aria-hidden className="size-6" />
      </button>

      {mounted ? createPortal(drawer(), document.body) : null}
    </>
  );

  function drawer() {
    return (
      <div className={cn('fixed inset-0 z-50 md:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
        <div className={cn('absolute inset-0 bg-ink/40 transition-opacity duration-200', open ? 'opacity-100' : 'opacity-0')} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="القائمة"
          className={cn(
            'absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-surface shadow-pop transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
            <Link href="/" onClick={close} className="flex items-center gap-2">
              <Image src="/brand/fatrina-mark.png" alt="" width={32} height={32} />
              <span className="font-sign text-section text-brand">فاترينة</span>
            </Link>
            <button type="button" data-autofocus onClick={close} aria-label="اقفل القائمة" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-sunken">
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="text-meta font-bold text-ink-3">تسوّق حسب نوع المتجر</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STORE_TYPES.map(({ type, plural, icon: Icon, path }) => (
                <Link key={type} href={path} onClick={close} className="flex min-h-12 items-center gap-2 rounded-card border border-line px-3 font-bold hover:border-brand">
                  <Icon aria-hidden className="size-5 text-accent" />
                  {plural}
                </Link>
              ))}
            </div>
            <Link href="/stores" onClick={close} className="mt-2 flex min-h-11 items-center gap-2 text-ui font-bold text-accent">
              <Store aria-hidden className="size-4" />
              كل المتاجر
            </Link>

            {sections.length ? (
              <>
                <p className="mt-6 text-meta font-bold text-ink-3">الأقسام</p>
                <ul className="mt-1">
                  {shown.map((s) => {
                    const Icon = categoryIcon(s.icon);
                    return (
                      <li key={s.id}>
                        <Link href={`/category/${s.id}`} onClick={close} className="flex min-h-12 items-center gap-3 border-b border-line font-semibold">
                          <Icon aria-hidden className="size-5 text-ink-3" />
                          {s.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {sections.length > 8 ? (
                  <button
                    type="button"
                    onClick={() => setAllSections(!allSections)}
                    className="flex min-h-11 cursor-pointer items-center gap-1 text-ui font-bold text-accent"
                  >
                    {allSections ? 'أقسام أقل' : `كل الأقسام (${sections.length})`}
                    <ChevronDown aria-hidden className={cn('size-4 transition-transform', allSections && 'rotate-180')} />
                  </button>
                ) : null}
              </>
            ) : null}

            <div className="mt-6 space-y-2">
              <Link href="/offers" onClick={close} className="flex min-h-12 items-center gap-3 rounded-card bg-accent-soft px-3 font-bold text-accent">
                <Percent aria-hidden className="size-5" />
                العروض والخصومات
              </Link>
              {[
                { href: '/account', label: 'حسابي' },
                { href: '/account/orders', label: 'طلباتي' },
                { href: '/cart', label: 'السلة' },
                { href: '/sell', label: 'ابدأ البيع على فاترينة' },
                { href: '/about', label: 'من نحن' },
                { href: '/faq', label: 'الأسئلة الشائعة' },
                { href: '/contact', label: 'تواصل معانا' },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={close} className="flex min-h-11 items-center px-1 font-semibold text-ink-2">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-line p-4">
            <OpenInApp path="" className="w-full">
              حمّل تطبيق فاترينة
            </OpenInApp>
          </div>
        </div>
      </div>
    );
  }
}
