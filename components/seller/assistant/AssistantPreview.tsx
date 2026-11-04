'use client';

import { Bot, LoaderCircle, RotateCcw, Send } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Panel } from '@/components/account/PageTitle';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { price } from '@/lib/format';

import { aiError } from './errors';
import type { PublicAssistantReply } from './types';

interface Msg {
  key: string;
  role: 'user' | 'assistant';
  text: string;
  unanswered?: boolean;
  products?: { id: string; title: string; price: number }[];
}

const SUGGESTIONS = ['إيه أكتر حاجة بتتباع عندكم؟', 'التوصيل بياخد قد إيه؟', 'ينفع أرجّع المنتج؟', 'مواعيدكم إيه؟'];
const rid = () => Math.random().toString(36).slice(2, 12);

/**
 * The owner chats with their own store assistant through the public endpoint, as a customer would.
 * Each reply counts toward the store's daily limit.
 */
export function AssistantPreview({ slug, name, enabled }: { slug: string; name: string; enabled: boolean }) {
  const [visitorId, setVisitorId] = useState(() => `owner-preview-${rid()}`);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (raw: string) => {
    const t = raw.trim().slice(0, 500);
    if (!t || busy) return;
    setError(null);
    setText('');
    setMessages((m) => [...m, { key: rid(), role: 'user', text: t }]);
    setBusy(true);
    try {
      const res = await api.post<PublicAssistantReply>(`brands/${encodeURIComponent(slug)}/assistant/messages`, { conversationId, visitorId, text: t });
      setConversationId(res.conversationId);
      setMessages((m) => [...m, { key: rid(), role: 'assistant', text: res.reply.text, unanswered: res.reply.unanswered, products: res.reply.products }]);
    } catch (e) {
      setError(aiError(e, 'المساعد مردّش. جرّب تاني.'));
      setText(t);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setVisitorId(`owner-preview-${rid()}`);
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  };

  return (
    <Panel
      title="جرّب المساعد"
      action={
        messages.length ? (
          <button type="button" onClick={reset} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-meta font-bold text-ink-2 hover:bg-sunken hover:text-ink">
            <RotateCcw aria-hidden className="size-4" />
            من الأول
          </button>
        ) : null
      }
    >
      <p className="-mt-2 mb-3 text-meta text-ink-3">اسأله زي ما العميل هيسأل. كل رد بيتحسب من ردود المساعد بتاعة النهارده.</p>
      {!enabled ? (
        <p className="rounded-card bg-sunken p-4 text-ui text-ink-2">شغّل المساعد واحفظ الإعدادات عشان تقدر تجرّبه.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div ref={list} className="flex h-80 flex-col gap-2 overflow-y-auto rounded-card bg-sunken p-3" aria-live="polite" aria-label={`محادثة مع ${name}`} role="log">
            {!messages.length ? (
              <div className="m-auto flex flex-col items-center gap-3 text-center">
                <Bot aria-hidden className="size-8 text-ink-3" />
                <p className="text-ui text-ink-2">ابدأ بسؤال من دول أو اكتب سؤالك</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => void send(s)} className="min-h-10 cursor-pointer rounded-full border border-line-strong bg-surface px-3 text-meta font-bold hover:border-brand hover:text-accent">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.key} className={cn('flex max-w-[85%] flex-col gap-1', m.role === 'user' ? 'self-start' : 'self-end')}>
                  <p className="sr-only">{m.role === 'user' ? 'انت:' : `${name}:`}</p>
                  <p
                    className={cn(
                      'whitespace-pre-line rounded-panel px-3.5 py-2 text-ui',
                      m.role === 'user' ? 'rounded-ss-sm bg-accent text-on-accent' : 'rounded-se-sm border border-line bg-surface text-ink',
                      m.unanswered && 'border-warning/40 bg-warning-soft',
                    )}
                  >
                    {m.text}
                  </p>
                  {m.products?.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {m.products.map((p) => (
                        <li key={p.id} className="rounded-full border border-line bg-surface px-2.5 py-1 text-meta">
                          {p.title} · {price(p.price)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {m.unanswered ? <p className="text-meta font-semibold text-warning">ماعرفش يجاوب — ضيف المعلومة دي في «معلومات إضافية».</p> : null}
                </div>
              ))
            )}
            {busy ? (
              <p className="flex items-center gap-2 self-end rounded-panel border border-line bg-surface px-3.5 py-2 text-meta text-ink-3">
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
                بيكتب...
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-meta font-semibold text-danger">
              {error}
            </p>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(text);
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor={inputId} className="sr-only">
              اكتب سؤال للمساعد
            </label>
            <input
              id={inputId}
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب سؤال زي العميل..."
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-surface px-4 text-ui focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
            <button type="submit" disabled={busy || !text.trim()} aria-label="ابعت" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
              <Send aria-hidden className="size-5 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      )}
    </Panel>
  );
}
