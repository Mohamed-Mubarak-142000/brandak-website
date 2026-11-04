'use client';

import { ExternalLink, LogIn, MoreVertical, Package, RefreshCw, RotateCcw, Send, Smartphone, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { OpenInApp } from '@/components/OpenInApp';
import { StoreLogo } from '@/components/StoreCard';
import { cn } from '@/lib/cn';
import { num } from '@/lib/format';
import { appPath } from '@/lib/links';

import { ChatProductCard } from './ChatProductCard';
import { useConversation, type AssistantAction, type ChatMessage } from './useConversation';

export interface ChatPanelProps {
  slug: string;
  name: string;
  greeting: string;
  suggestions: string[];
  productId?: string;
  /** wa.me link of the store, when it has WhatsApp. */
  whatsapp?: string | null;
  store: { name: string; logoUrl: string | null };
  open: boolean;
  onClose: () => void;
  onDisabled: () => void;
}

const MAX = 500;
const chip = 'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold text-ink transition-colors hover:border-brand';

export function ChatPanel({ slug, name, greeting, suggestions, productId, whatsapp, store, open, onClose, onDisabled }: ChatPanelProps) {
  const { messages, busy, error, send, retry, reset } = useConversation(slug, productId);
  const [draft, setDraft] = useState('');
  const [menu, setMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const pathname = usePathname();

  // Focus the box whenever the window opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes the menu first, then the window.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menu) setMenu(false);
      else onClose();
    };
    const onPointer = (e: PointerEvent) => {
      if (menu && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, menu, onClose]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el && open) el.scrollTop = el.scrollHeight;
  }, [messages, busy, error, open]);

  useEffect(() => {
    if (error?.kind === 'disabled') onDisabled();
  }, [error, onDisabled]);

  const submit = (text = draft) => {
    if (send(text)) {
      if (text === draft) setDraft('');
      inputRef.current?.focus();
    }
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const blocked = error && (error.kind === 'store_limit' || error.kind === 'visitor_limit' || error.kind === 'disabled');
  const near = draft.length >= MAX - 100;

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      hidden={!open}
      className={cn(
        'fixed top-0 bottom-0 start-0 end-0 z-50 flex flex-col bg-surface',
        'sm:top-auto sm:end-auto sm:bottom-6 sm:start-6 sm:h-[min(600px,calc(100dvh-3rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-window sm:border sm:border-line sm:shadow-pop',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <StoreLogo store={store} size={40} />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-ui font-extrabold">
            {name}
          </h2>
          <p className="flex items-center gap-1.5 text-meta text-ink-3">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            متاح دلوقتي · بالذكاء الاصطناعي
          </p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-haspopup="menu"
            aria-label="خيارات المحادثة"
            className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-2 hover:bg-sunken"
          >
            <MoreVertical aria-hidden className="size-5" />
          </button>
          {menu ? (
            <div role="menu" className="absolute end-0 top-full z-10 mt-1 w-48 rounded-panel border border-line bg-surface p-1.5 shadow-pop">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  reset();
                  setDraft('');
                  setMenu(false);
                  inputRef.current?.focus();
                }}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-card px-3 text-ui font-bold hover:bg-sunken"
              >
                <RotateCcw aria-hidden className="size-4" />
                محادثة جديدة
              </button>
            </div>
          ) : null}
        </div>
        <button type="button" onClick={onClose} aria-label="اقفل المحادثة" className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-2 hover:bg-sunken">
          <X aria-hidden className="size-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-sunken/60 px-4 py-4">
        <Bubble role="assistant">{greeting}</Bubble>

        {!messages.length && suggestions.length ? (
          <ul aria-label="أسئلة مقترحة" className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => submit(s)} disabled={busy} className={cn(chip, 'min-h-11 py-2 text-start font-semibold leading-snug')}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {messages.map((m) => (
          <Message key={m.id} message={m} whatsapp={whatsapp} next={pathname} openPath={productId ? appPath.product(productId) : appPath.brand(slug)} />
        ))}

        {busy ? (
          <div className="flex justify-start">
            <span className="inline-flex items-center gap-1 rounded-panel rounded-ss-md bg-surface px-4 py-3 shadow-card" role="status" aria-label="المساعد بيكتب">
              {[0, 150, 300].map((d) => (
                <span key={d} aria-hidden style={{ animationDelay: `${d}ms` }} className="size-2 rounded-full bg-ink-3 motion-safe:animate-bounce" />
              ))}
            </span>
          </div>
        ) : null}

        {error ? (
          <div role="alert" className="rounded-panel border border-line bg-surface p-3 text-ui">
            <p className={cn('font-semibold', error.kind === 'retry' || error.kind === 'fatal' ? 'text-danger' : 'text-ink')}>{error.message}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {error.kind === 'retry' ? (
                <button type="button" onClick={retry} className={chip}>
                  <RefreshCw aria-hidden className="size-4" />
                  جرّب تاني
                </button>
              ) : null}
              {whatsapp && (error.kind === 'store_limit' || error.kind === 'disabled') ? <WhatsAppLink href={whatsapp} /> : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* New assistant replies are read out without moving focus. */}
      <div aria-live="polite" className="sr-only">
        {lastAssistant ? lastAssistant.text : ''}
      </div>

      {/* Composer */}
      <form
        className="border-t border-line bg-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor={`${titleId}-input`}>
            اكتب سؤالك
          </label>
          <textarea
            id={`${titleId}-input`}
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            maxLength={MAX}
            rows={1}
            disabled={!!blocked}
            placeholder={blocked ? 'مينفعش تبعت رسايل دلوقتي' : 'اكتب سؤالك…'}
            className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-card border border-line-strong bg-surface px-3 py-2.5 text-ui leading-normal outline-none placeholder:text-ink-3 focus-visible:border-brand disabled:bg-sunken"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim() || !!blocked}
            aria-label="ابعت"
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send aria-hidden className="size-5 -scale-x-100" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-meta text-ink-3">
          <p>الردود بالذكاء الاصطناعي، وممكن تحتاج تأكيد من المتجر</p>
          {near ? (
            <span className={cn('shrink-0 tabular-nums', draft.length >= MAX && 'font-bold text-danger')} aria-live="polite">
              {num(draft.length)}/{num(MAX)}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

/** RTL: the assistant speaks from the start (right), the visitor from the end (left). */
function Bubble({ role, children }: { role: ChatMessage['role']; children: React.ReactNode }) {
  const user = role === 'user';
  return (
    <div className={cn('flex', user ? 'justify-end' : 'justify-start')}>
      <p
        className={cn(
          'max-w-[85%] whitespace-pre-line break-words rounded-panel px-4 py-2.5 text-ui leading-relaxed',
          user ? 'rounded-se-md bg-accent-soft text-ink' : 'rounded-ss-md bg-surface text-ink shadow-card',
        )}
      >
        <span className="sr-only">{user ? 'إنت: ' : 'المساعد: '}</span>
        {children}
      </p>
    </div>
  );
}

function Message({ message: m, whatsapp, next, openPath }: { message: ChatMessage; whatsapp?: string | null; next: string; openPath: string }) {
  if (m.role === 'user') return <Bubble role="user">{m.text}</Bubble>;
  const actions = (m.actions ?? []).filter((a) => a !== 'whatsapp' || whatsapp);
  const showWa = m.unanswered && whatsapp && !actions.includes('whatsapp');
  return (
    <div className="space-y-2">
      <Bubble role="assistant">{m.text}</Bubble>
      {m.products?.length ? (
        <ul aria-label="منتجات مقترحة" className="rail -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1">
          {m.products.map((p) => (
            <li key={p.id} className="flex">
              <ChatProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : null}
      {m.unanswered ? (
        <p className="flex items-center gap-1.5 text-meta text-ink-3">
          <Package aria-hidden className="size-3.5" />
          المتجر هيتأكد ويرد عليك
        </p>
      ) : null}
      {actions.length || showWa ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Action key={a} action={a} whatsapp={whatsapp} next={next} openPath={openPath} />
          ))}
          {showWa && whatsapp ? <WhatsAppLink href={whatsapp} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function Action({ action, whatsapp, next, openPath }: { action: AssistantAction; whatsapp?: string | null; next: string; openPath: string }) {
  switch (action) {
    case 'login':
      return (
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={chip}>
          <LogIn aria-hidden className="size-4" />
          سجّل دخول
        </Link>
      );
    case 'orders':
      return (
        <Link href="/account/orders" className={chip}>
          <Package aria-hidden className="size-4" />
          طلباتي
        </Link>
      );
    case 'whatsapp':
      return whatsapp ? <WhatsAppLink href={whatsapp} /> : null;
    case 'open_app':
      return (
        <OpenInApp path={openPath} variant="secondary" className="px-4 text-ui">
          <Smartphone aria-hidden className="size-4" />
          افتح التطبيق
        </OpenInApp>
      );
    default:
      return null;
  }
}

function WhatsAppLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(chip, 'border-success/40 text-success hover:border-success')}>
      <ExternalLink aria-hidden className="size-4" />
      كلّم المتجر على واتساب
    </a>
  );
}
