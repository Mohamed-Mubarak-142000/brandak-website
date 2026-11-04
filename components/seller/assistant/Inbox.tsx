'use client';

import { CircleHelp, LoaderCircle, MessagesSquare, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Panel } from '@/components/account/PageTitle';
import { Alert, btn } from '@/components/auth/fields';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';

import { aiError } from './errors';
import { ago } from './time';
import type { AssistantConversationItem } from './types';

const LIMIT = 20;
type Tab = 'all' | 'unanswered';
const path = (tab: Tab, page: number) => `brand/assistant/conversations?limit=${LIMIT}&page=${page}${tab === 'unanswered' ? '&unanswered=true' : ''}`;

/** What customers asked the store assistant; "ماعرفش يجاوب" shows the chats with a gap to fill. */
export function Inbox({ initial, total: initialTotal, now }: { initial: AssistantConversationItem[]; total: number; now: number }) {
  const [tab, setTab] = useState<Tab>('all');
  const [items, setItems] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useRef(0);

  const load = async (t: Tab) => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.page<AssistantConversationItem>(path(t, 1));
      if (id !== run.current) return;
      setItems(res.data);
      setTotal(Number(res.meta?.total ?? res.data.length));
      setPage(1);
    } catch (e) {
      if (id === run.current) setError(aiError(e, 'معرفناش نجيب المحادثات. جرّب تاني.'));
    } finally {
      if (id === run.current) setLoading(false);
    }
  };

  const pick = (t: Tab) => {
    if (t === tab) return;
    setTab(t);
    void load(t);
  };

  const loadMore = async () => {
    setMore(true);
    try {
      const res = await api.page<AssistantConversationItem>(path(tab, page + 1));
      setItems((xs) => [...xs, ...res.data.filter((n) => !xs.some((x) => x.id === n.id))]);
      setPage((p) => p + 1);
      setTotal(Number(res.meta?.total ?? total));
    } catch (e) {
      setError(aiError(e));
    } finally {
      setMore(false);
    }
  };

  return (
    <Panel title="أسئلة العملاء">
      <div role="tablist" aria-label="المحادثات" className="mb-4 flex w-fit gap-1 rounded-full bg-sunken p-1">
        {(
          [
            ['all', 'الكل'],
            ['unanswered', 'ماعرفش يجاوب'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => pick(key)}
            className={cn('min-h-10 cursor-pointer rounded-full px-4 text-ui font-bold', tab === key ? 'bg-surface text-ink shadow-card' : 'text-ink-2 hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <Alert title={error} className="mb-3">
          <button type="button" className={btn.quiet} onClick={() => void load(tab)}>
            جرّب تاني
          </button>
        </Alert>
      ) : null}

      {loading ? (
        <ul aria-busy className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-18 animate-pulse rounded-card bg-skeleton" />
          ))}
        </ul>
      ) : !items.length ? (
        <div className="flex flex-col items-center rounded-card bg-sunken px-4 py-10 text-center">
          {tab === 'unanswered' ? <CircleHelp aria-hidden className="size-8 text-success" /> : <MessagesSquare aria-hidden className="size-8 text-ink-3" />}
          <p className="mt-2 font-bold">{tab === 'unanswered' ? 'المساعد جاوب على كل حاجة' : 'لسه مفيش محادثات'}</p>
          <p className="mt-1 max-w-sm text-meta text-ink-2">
            {tab === 'unanswered' ? 'لما يتسأل سؤال ومايلاقيش إجابته في بياناتك هيظهر هنا.' : 'أول ما عميل يسأل المساعد في صفحة متجرك هتلاقي المحادثة هنا.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-line">
            {items.map((c) => (
              <li key={c.id}>
                <Link href={`/seller/assistant/${c.id}`} className="flex items-start gap-3 rounded-card px-2 py-3 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-brand">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-ink-3">
                    <UserRound aria-hidden className="size-5" />
                    {!c.seen ? <span className="absolute -top-0.5 -inset-e-0.5 size-3 rounded-full border-2 border-surface bg-brand" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('truncate', !c.seen ? 'font-extrabold' : 'font-bold')}>
                        {c.customerFirstName || 'زائر'}
                        {!c.seen ? <span className="sr-only"> (جديدة)</span> : null}
                      </span>
                      <time dateTime={c.lastAt} className="shrink-0 text-meta text-ink-3">
                        {ago(c.lastAt, now)}
                      </time>
                    </span>
                    <span className={cn('mt-0.5 block truncate text-ui', !c.seen ? 'text-ink' : 'text-ink-2')}>
                      {c.lastMessage ? `${c.lastMessage.role === 'assistant' ? 'المساعد: ' : ''}${c.lastMessage.text}` : '—'}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-2 text-meta">
                      <span className="text-ink-3">{c.count} رسالة</span>
                      {c.signedIn ? <span className="text-ink-3">· عميل مسجّل</span> : null}
                      {c.hasUnanswered ? <span className="rounded-full bg-warning-soft px-2 font-bold text-warning">ماعرفش يجاوب</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {items.length < total ? (
            <button type="button" onClick={loadMore} disabled={more} className={cn(btn.secondary, 'mx-auto mt-3 flex')}>
              {more ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
              اعرض أكتر
            </button>
          ) : null}
        </>
      )}
    </Panel>
  );
}
