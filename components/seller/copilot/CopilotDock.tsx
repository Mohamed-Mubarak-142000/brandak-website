'use client';

import { Maximize2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';

import { CopilotChat, type CopilotChatHandle } from './CopilotChat';

/** The store id, fetched once per visit the first time the dock opens. */
let brandIdPromise: Promise<string> | null = null;
const myBrandId = () => {
  brandIdPromise ??= api.get<{ id: string }>('brands/me').then(
    (b) => b.id,
    (e) => {
      brandIdPromise = null;
      throw e;
    },
  );
  return brandIdPromise;
};

/**
 * A floating "مساعدك الذكي" button on every /seller page (bottom-start, lifted above a page's
 * bottom bar via the `--seller-bottom-bar` CSS variable) that opens a compact copilot chat.
 * Hidden on /seller/copilot, which shows the same chat full-page.
 */
export function CopilotDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const chat = useRef<CopilotChatHandle>(null);
  const titleId = useId();
  const panelId = useId();
  const hidden = pathname?.startsWith('/seller/copilot') || pathname?.startsWith('/seller/apply');

  const show = () => {
    setOpen(true);
    if (!brandId) {
      setFailed(false);
      myBrandId().then(setBrandId, () => setFailed(true));
    }
  };
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  // Escape closes the panel, focus goes back to the button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus the message box when the panel opens (and once the store id arrives).
  useEffect(() => {
    if (open) chat.current?.focus();
  }, [open, brandId]);

  // Another page closes the panel.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-s-4 bottom-[calc(1rem+var(--seller-bottom-bar,0px))] z-40 flex flex-col items-start gap-3 print:hidden">
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="pointer-events-auto flex h-[min(36rem,calc(100dvh-8rem-var(--seller-bottom-bar,0px)))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-window border border-line bg-surface shadow-pop"
        >
          {failed ? (
            <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <h2 id={titleId} className="font-bold">
                معرفناش نفتح مساعدك دلوقتي
              </h2>
              <div className="flex gap-2">
                <button type="button" onClick={show} className="min-h-10 cursor-pointer rounded-full bg-accent px-4 text-ui font-bold text-on-accent hover:bg-accent-hover">
                  جرّب تاني
                </button>
                <button type="button" onClick={close} className="min-h-10 cursor-pointer rounded-full border border-line-strong px-4 text-ui font-bold hover:border-brand">
                  قفل
                </button>
              </div>
            </div>
          ) : (
            <CopilotChat
              ref={chat}
              brandId={brandId}
              compact
              titleId={titleId}
              actions={
                <>
                  <Link href="/seller/copilot" aria-label="افتح مساعدك في صفحة كاملة" className="grid size-10 place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink">
                    <Maximize2 aria-hidden className="size-4" />
                  </Link>
                  <button type="button" onClick={close} aria-label="قفل مساعدك" className="grid size-10 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink">
                    <X aria-hidden className="size-5" />
                  </button>
                </>
              }
            />
          )}
        </section>
      ) : null}
      <button
        ref={button}
        type="button"
        onClick={() => (open ? close() : show())}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn(
          'pointer-events-auto inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-4 font-bold shadow-pop transition-colors',
          open ? 'border border-line-strong bg-surface text-ink hover:text-accent' : 'bg-accent text-on-accent hover:bg-accent-hover',
        )}
      >
        {open ? <X aria-hidden className="size-5" /> : <Sparkles aria-hidden className="size-5" />}
        <span className={cn(open && 'sr-only sm:not-sr-only')}>{open ? 'قفل' : 'مساعدك الذكي'}</span>
      </button>
    </div>
  );
}
