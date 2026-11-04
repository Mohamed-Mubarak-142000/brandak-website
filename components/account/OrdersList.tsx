'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { OrderStatus, OrderSummary } from '@/lib/types';

import { accountError } from '@/components/auth/errors';
import { Alert, btn } from '@/components/auth/fields';

import { OrderCard, OrderCardSkeleton } from './OrderCard';
import { ACTIVE_STATUSES } from './orderStatus';

type Filter = 'all' | 'active' | 'delivered' | 'cancelled';

const FILTERS: { key: Filter; label: string; statuses: OrderStatus[] }[] = [
  { key: 'all', label: 'الكل', statuses: [] },
  { key: 'active', label: 'الحالية', statuses: ACTIVE_STATUSES },
  { key: 'delivered', label: 'اتسلمت', statuses: ['DELIVERED'] },
  { key: 'cancelled', label: 'اتلغت', statuses: ['CANCELLED', 'REFUSED'] },
];

const LIMIT = 20;

/**
 * "الكل" pages through orders/me. The other filters span several statuses and the API filters by
 * one, so they ask for each status and merge (newest first).
 */
export function OrdersList({ initial, total: initialTotal }: { initial: OrderSummary[]; total: number }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [orders, setOrders] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useRef(0);

  const load = useCallback(async (f: Filter) => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    try {
      const statuses = FILTERS.find((x) => x.key === f)!.statuses;
      if (!statuses.length) {
        const res = await api.page<OrderSummary>(`orders/me?limit=${LIMIT}&page=1`);
        if (id !== run.current) return;
        setOrders(res.data);
        setTotal(Number(res.meta?.total ?? res.data.length));
      } else {
        const lists = await Promise.all(statuses.map((s) => api.get<OrderSummary[]>(`orders/me?status=${s}&limit=100`)));
        if (id !== run.current) return;
        const merged = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setOrders(merged);
        setTotal(merged.length);
      }
      setPage(1);
    } catch (e) {
      if (id === run.current) setError(accountError(e, 'معرفناش نجيب الطلبات. جرّب تاني.'));
    } finally {
      if (id === run.current) setLoading(false);
    }
  }, []);

  const pick = (f: Filter) => {
    if (f === filter) return;
    setFilter(f);
    void load(f);
  };

  const loadMore = async () => {
    setMore(true);
    try {
      const res = await api.page<OrderSummary>(`orders/me?limit=${LIMIT}&page=${page + 1}`);
      setOrders((o) => [...o, ...res.data.filter((n) => !o.some((x) => x.id === n.id))]);
      setPage((p) => p + 1);
      setTotal(Number(res.meta?.total ?? total));
    } catch (e) {
      setError(accountError(e));
    } finally {
      setMore(false);
    }
  };

  const empty = FILTERS.find((x) => x.key === filter)!;

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="فلترة الطلبات" className="rail -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => pick(f.key)}
            className={cn(
              'inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border px-5 text-ui font-bold transition-colors',
              filter === f.key ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink-2 hover:border-brand',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <Alert title={error}>
          <button type="button" onClick={() => void load(filter)} className="font-bold text-accent underline underline-offset-4">
            جرّب تاني
          </button>
        </Alert>
      ) : null}

      <div aria-live="polite" aria-busy={loading}>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length ? (
          <ul className="flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.id}>
                <OrderCard order={o} />
              </li>
            ))}
          </ul>
        ) : !error ? (
          <EmptyState
            art="box"
            title={filter === 'all' ? 'لسه معملتش طلبات' : `مفيش طلبات ${empty.label}`}
            body={filter === 'all' ? 'أول طلب ليك هيظهر هنا وتقدر تتابعه خطوة بخطوة.' : 'جرّب فلتر تاني.'}
            action={
              filter === 'all' ? (
                <Link href="/" className={btn.primary}>
                  ابدأ التسوق
                </Link>
              ) : (
                <button type="button" onClick={() => pick('all')} className={btn.secondary}>
                  كل الطلبات
                </button>
              )
            }
          />
        ) : null}
      </div>

      {filter === 'all' && !loading && orders.length < total ? (
        <button type="button" onClick={() => void loadMore()} disabled={more} className={cn(btn.secondary, 'self-center')}>
          {more ? 'بنحمّل...' : 'طلبات أقدم'}
        </button>
      ) : null}
    </div>
  );
}
