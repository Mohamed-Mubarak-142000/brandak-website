'use client';

import { MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { cn } from '@/lib/cn';

import { ChatPanel, type ChatPanelProps } from './ChatPanel';

type Props = Omit<ChatPanelProps, 'open' | 'onClose' | 'onDisabled'> & {
  /** Product pages have a sticky order bar at the bottom on phones/tablets; sit above it. */
  aboveOrderBar?: boolean;
};

const MOBILE = '(max-width: 639.98px)';

/**
 * The floating "اسأل …" button and the chat window it opens. The window mounts on first open (so
 * nothing runs for visitors who never use it) and then stays mounted, hidden, to keep its state.
 */
export function AssistantChat({ aboveOrderBar, ...panel }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    flushSync(() => setOpen(false));
    buttonRef.current?.focus();
  }, []);

  const onDisabled = useCallback(() => setDisabled(true), []);

  // Full-screen on phones: the page behind shouldn't scroll. Desktop keeps the page usable.
  useEffect(() => {
    if (!open || !window.matchMedia(MOBILE).matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (disabled && !open) return null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        hidden={open}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`اسأل ${panel.name}، مساعد بالذكاء الاصطناعي`}
        className={cn(
          'fixed start-4 z-40 inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent text-on-accent shadow-pop transition-colors hover:bg-accent-hover',
          'size-14 justify-center sm:size-auto sm:min-h-12 sm:ps-4 sm:pe-3',
          aboveOrderBar ? 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-6' : 'bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6',
          'sm:start-6',
        )}
      >
        <MessageCircle aria-hidden className="size-6 shrink-0 sm:size-5" />
        <span className="hidden max-w-48 truncate text-ui font-bold sm:inline">اسأل {panel.name}</span>
        <span
          aria-hidden
          className="absolute -top-1 -end-1 rounded-full border-2 border-surface bg-ink px-1.5 text-[10px] font-extrabold leading-4 text-white sm:static sm:border-0 sm:bg-on-accent/20"
        >
          AI
        </span>
      </button>

      {mounted ? <ChatPanel {...panel} open={open} onClose={close} onDisabled={onDisabled} /> : null}
    </>
  );
}
