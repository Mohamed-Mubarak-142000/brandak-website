'use client';

import { Check, Copy, LoaderCircle, RotateCcw, Send, Sparkles, SquarePen } from 'lucide-react';
import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from 'react';

import { cn } from '@/lib/cn';

import { Markdown } from './Markdown';
import { useCopilot } from './useCopilot';

const SUGGESTIONS = ['مبيعاتي الأسبوع ده؟', 'إيه المنتجات اللي قربت تخلص؟', 'الناس بتدوّر على إيه ومش لاقياه؟', 'اكتبلي وصف لمنتج', 'اقترح عرض للأسبوع ده'];

export interface CopilotChatHandle {
  focus: () => void;
}

/**
 * The copilot conversation, used by /seller/copilot (`full`) and the floating dock (`compact`).
 * Both read the same per-store thread.
 */
export function CopilotChat({
  brandId,
  compact,
  titleId,
  actions,
  ref,
}: {
  brandId: string | null;
  compact?: boolean;
  titleId?: string;
  /** Extra header buttons (the dock's expand / close). */
  actions?: React.ReactNode;
  ref?: Ref<CopilotChatHandle>;
}) {
  const { messages, busy, error, announce, send, reset, dismissError } = useCopilot(brandId);
  const [text, setText] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const inputId = useId();
  useImperativeHandle(ref, () => ({ focus: () => input.current?.focus() }), []);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, busy, error]);

  const submit = async (t: string) => {
    if (!t.trim() || busy) return;
    setText('');
    const ok = await send(t);
    if (!ok) setText(t);
    input.current?.focus();
  };

  const loading = !brandId;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2 sm:px-4">
        <p id={titleId} className="flex min-w-0 items-center gap-2 font-extrabold">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Sparkles aria-hidden className="size-4" />
          </span>
          <span className="truncate">مساعدك الذكي</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {messages.length ? (
            <button
              type="button"
              onClick={() => {
                reset();
                setText('');
                input.current?.focus();
              }}
              aria-label={compact ? 'محادثة جديدة' : undefined}
              className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-meta font-bold text-ink-2 hover:bg-sunken hover:text-ink"
            >
              <SquarePen aria-hidden className="size-4" />
              <span className={cn(compact && 'sr-only min-[400px]:not-sr-only')}>محادثة جديدة</span>
            </button>
          ) : null}
          {actions}
        </div>
      </div>

      <div ref={list} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
        {loading ? (
          <div className="grid h-full place-items-center" aria-busy>
            <LoaderCircle aria-label="بنحمّل" className="size-6 animate-spin text-ink-3" />
          </div>
        ) : !messages.length ? (
          <div className={cn('mx-auto flex max-w-lg flex-col items-center text-center', compact ? 'gap-3 pt-2' : 'gap-4 pt-6')}>
            <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
              <Sparkles aria-hidden className="size-7" />
            </span>
            <div>
              <p className="text-section font-extrabold">أهلاً! أنا مساعدك في إدارة المتجر</p>
              <p className="mt-1 text-ui text-ink-2">اسألني عن مبيعاتك وطلباتك ومخزونك، أو خليني أكتبلك وصف منتج أو رد على عميل أو فكرة عرض. بقرا بيانات متجرك بس ومش بغيّر حاجة.</p>
            </div>
            <ul className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" disabled={busy} onClick={() => void submit(s)} className="min-h-10 cursor-pointer rounded-full border border-line-strong bg-surface px-3.5 text-ui font-bold hover:border-brand hover:text-accent disabled:opacity-60">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="flex flex-col gap-3" aria-label="المحادثة">
            {messages.map((m) => (
              <li key={m.key} className={cn('flex max-w-[92%] flex-col gap-1', m.role === 'user' ? 'self-start items-start' : 'self-end items-end', !compact && 'sm:max-w-[80%]')}>
                <span className="sr-only">{m.role === 'user' ? 'انت:' : 'مساعدك:'}</span>
                {m.role === 'user' ? (
                  <p className="whitespace-pre-line rounded-panel rounded-ss-sm bg-accent px-3.5 py-2.5 text-ui text-on-accent">{m.text}</p>
                ) : (
                  <>
                    <div className="rounded-panel rounded-se-sm border border-line bg-sunken px-3.5 py-2.5 text-ui text-ink">
                      <Markdown text={m.text} />
                    </div>
                    <CopyButton text={m.text} />
                  </>
                )}
              </li>
            ))}
            {busy ? (
              <li className="flex items-center gap-2 self-end rounded-panel border border-line bg-sunken px-3.5 py-2.5 text-meta text-ink-3">
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
                بيفكّر...
              </li>
            ) : null}
          </ol>
        )}
        {error ? (
          <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 rounded-card bg-danger-soft px-3.5 py-2.5 text-ui text-danger">
            <span className="min-w-0 flex-1 font-semibold">{error.text}</span>
            {error.retry ? (
              <button
                type="button"
                onClick={() => {
                  const t = error.retry!;
                  setText('');
                  void submit(t);
                }}
                className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full bg-surface px-3 text-meta font-bold text-ink hover:text-accent"
              >
                <RotateCcw aria-hidden className="size-3.5" />
                جرّب تاني
              </button>
            ) : (
              <button type="button" onClick={dismissError} className="min-h-9 cursor-pointer rounded-full px-3 text-meta font-bold hover:bg-surface">
                تمام
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Only the new reply is read out, not the whole log. */}
      <p aria-live="polite" className="sr-only">
        {announce ? `رد مساعدك: ${announce}` : ''}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(text);
        }}
        className="flex items-end gap-2 border-t border-line p-2.5 sm:p-3"
      >
        <label htmlFor={inputId} className="sr-only">
          اكتب سؤالك لمساعدك الذكي
        </label>
        <textarea
          ref={input}
          id={inputId}
          rows={1}
          value={text}
          maxLength={1000}
          disabled={loading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void submit(text);
            }
          }}
          placeholder="اسأل عن متجرك..."
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-card border border-line-strong bg-surface px-3.5 py-2.5 text-ui field-sizing-content focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
        />
        <button type="submit" disabled={busy || loading || !text.trim()} aria-label="ابعت" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Send aria-hidden className="size-5 rtl:-scale-x-100" />}
        </button>
      </form>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1500);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => setDone(true),
          () => undefined,
        );
      }}
      className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full px-2 text-meta text-ink-3 hover:bg-sunken hover:text-ink"
    >
      {done ? <Check aria-hidden className="size-3.5 text-success" /> : <Copy aria-hidden className="size-3.5" />}
      <span aria-live="polite">{done ? 'اتنسخ' : 'نسخ'}</span>
    </button>
  );
}
