'use client';

import { Archive, ArchiveRestore, ImageOff, LoaderCircle, Pencil, Plus, Search, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, btn, inputClass } from '@/components/auth/fields';
import { Dialog } from '@/components/account/Dialog';
import { EmptyState } from '@/components/EmptyState';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num, price } from '@/lib/format';

import { productError } from './helpers';
import { STATUS_AR, type BrandProduct, type ProductStatus } from './types';
import { Skeleton } from './ui';

const TABS: { key: ProductStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'ACTIVE', label: 'منشور' },
  { key: 'DRAFT', label: 'مسودة' },
  { key: 'ARCHIVED', label: 'مؤرشف' },
];
const LIMIT = 20;
const LOW_STOCK = 3;

const STATUS_TONE: Record<ProductStatus, string> = {
  ACTIVE: 'bg-success-soft text-success',
  DRAFT: 'bg-sunken text-ink-2',
  ARCHIVED: 'bg-warning-soft text-warning',
};

const query = (tab: ProductStatus | 'ALL', q: string, page: number) =>
  `brand/products?limit=${LIMIT}&page=${page}${tab === 'ALL' ? '' : `&status=${tab}`}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

export function ProductsList({ initial, total: initialTotal }: { initial: BrandProduct[]; total: number }) {
  const [tab, setTab] = useState<ProductStatus | 'ALL'>('ALL');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<BrandProduct | null>(null);
  const run = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const load = useCallback(async (t: ProductStatus | 'ALL', search: string) => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    try {
      const res = await api.page<BrandProduct>(query(t, search, 1));
      if (id !== run.current) return;
      setItems(res.data);
      setTotal(Number(res.meta?.total ?? res.data.length));
      setPage(1);
    } catch (e) {
      if (id === run.current) setError(productError(e, 'معرفناش نجيب المنتجات. جرّب تاني.'));
    } finally {
      if (id === run.current) setLoading(false);
    }
  }, []);

  // Search as you type (debounced).
  const typed = (v: string) => {
    setText(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const next = v.trim();
      if (next === q) return;
      setQ(next);
      void load(tab, next);
    }, 350);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = (t: ProductStatus | 'ALL') => {
    if (t === tab) return;
    setTab(t);
    void load(t, q);
  };

  const loadMore = async () => {
    setMore(true);
    try {
      const res = await api.page<BrandProduct>(query(tab, q, page + 1));
      setItems((xs) => [...xs, ...res.data.filter((n) => !xs.some((x) => x._id === n._id))]);
      setPage((p) => p + 1);
      setTotal(Number(res.meta?.total ?? total));
    } catch (e) {
      setNotice({ tone: 'danger', text: productError(e) });
    } finally {
      setMore(false);
    }
  };

  /** Applies a change to one product and drops it from a tab it no longer belongs to. */
  const replace = (p: BrandProduct) =>
    setItems((xs) => (tab === 'ALL' && p.status !== 'ARCHIVED') || tab === p.status ? xs.map((x) => (x._id === p._id ? p : x)) : xs.filter((x) => x._id !== p._id));

  const setStatus = async (p: BrandProduct, status: ProductStatus) => {
    setBusyId(p._id);
    setNotice(null);
    try {
      const next = await api.patch<BrandProduct>(`brand/products/${p._id}`, { status });
      replace(next);
      setNotice({ tone: 'success', text: status === 'ACTIVE' ? `«${p.title}» اتنشر.` : `«${p.title}» رجع مسودة.` });
    } catch (e) {
      setNotice({ tone: 'danger', text: `${productError(e)} افتح المنتج وكمّل بياناته.` });
    } finally {
      setBusyId(null);
    }
  };

  const archive = async (p: BrandProduct) => {
    setArchiving(null);
    setBusyId(p._id);
    setNotice(null);
    try {
      await api.delete(`brand/products/${p._id}`);
      replace({ ...p, status: 'ARCHIVED' });
      setNotice({ tone: 'success', text: `«${p.title}» اتأرشف. تقدر ترجّعه من «مؤرشف».` });
    } catch (e) {
      setNotice({ tone: 'danger', text: productError(e) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="حالة المنتجات" className="flex gap-1 overflow-x-auto rounded-full bg-sunken p-1 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => pick(t.key)}
              className={cn('min-h-10 shrink-0 cursor-pointer rounded-full px-4 text-ui font-bold transition-colors', tab === t.key ? 'bg-surface text-ink shadow-card' : 'text-ink-2 hover:text-ink')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">ابحث في منتجاتك</span>
          <Search aria-hidden className="pointer-events-none absolute inset-y-0 inset-s-3.5 my-auto size-5 text-ink-3" />
          <input type="search" value={text} onChange={(e) => typed(e.target.value)} placeholder="اسم المنتج" className={cn(inputClass, 'ps-11')} />
        </label>
      </div>

      <div aria-live="polite">{notice ? <Alert tone={notice.tone} title={notice.text} /> : null}</div>

      {error ? (
        <Alert title={error}>
          <button type="button" className={btn.quiet} onClick={() => void load(tab, q)}>
            جرّب تاني
          </button>
        </Alert>
      ) : loading ? (
        <ul className="flex flex-col gap-3" aria-busy>
          {[0, 1, 2, 3].map((i) => (
            <li key={i}>
              <Skeleton className="h-24" />
            </li>
          ))}
        </ul>
      ) : !items.length ? (
        q || tab !== 'ALL' ? (
          <EmptyState art="search" title="مفيش منتجات هنا" body={q ? `مفيش منتج اسمه «${q}» في القائمة دي.` : 'جرّب قائمة تانية.'} />
        ) : (
          <EmptyState
            art="box"
            title="ضيف أول منتج"
            body="صور حلوة + وصف واضح + مقاسات = مبيعات أكتر. عندك منتجات كتير؟ استوردها من Excel في تطبيق فاترينة."
            action={
              <Link href="/seller/products/new" className={btn.primary}>
                <Plus aria-hidden className="size-5" />
                إضافة منتج
              </Link>
            }
          />
        )
      ) : (
        <>
          <p className="text-meta text-ink-3">{num(total)} منتج</p>
          <ul className="flex flex-col gap-3">
            {items.map((p) => (
              <ProductRow
                key={p._id}
                p={p}
                busy={busyId === p._id}
                onPublish={() => void setStatus(p, 'ACTIVE')}
                onRestore={() => void setStatus(p, 'DRAFT')}
                onArchive={() => setArchiving(p)}
              />
            ))}
          </ul>
          {items.length < total ? (
            <button type="button" onClick={loadMore} disabled={more} className={cn(btn.secondary, 'self-center')}>
              {more ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
              اعرض أكتر
            </button>
          ) : null}
        </>
      )}

      <Dialog
        open={!!archiving}
        onClose={() => setArchiving(null)}
        title="أرشفة المنتج؟"
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={() => setArchiving(null)}>
              إلغاء
            </button>
            <button type="button" className={btn.danger} onClick={() => archiving && void archive(archiving)}>
              أرشفة
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">«{archiving?.title}» هيختفي من المتجر. تقدر ترجّعه بعدين من «مؤرشف».</p>
      </Dialog>
    </div>
  );
}

const iconBtn =
  'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-meta font-bold text-ink transition-colors hover:border-brand hover:text-accent disabled:cursor-not-allowed disabled:opacity-60';

function ProductRow({ p, busy, onPublish, onArchive, onRestore }: { p: BrandProduct; busy: boolean; onPublish: () => void; onArchive: () => void; onRestore: () => void }) {
  const low = p.status !== 'ARCHIVED' && p.totalStock <= LOW_STOCK;
  const cover = p.images[0]?.url;
  return (
    <li className={cn('flex flex-wrap items-center gap-3 rounded-panel border bg-surface p-3 sm:flex-nowrap sm:gap-4', low ? 'border-danger/30' : 'border-line')}>
      <Link href={`/seller/products/${p._id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-card focus-visible:outline-2 focus-visible:outline-brand">
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken sm:h-20">
          {cover ? <Image src={cover} alt="" fill sizes="64px" className="object-cover" /> : <ImageOff aria-hidden className="size-6 text-ink-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{p.title}</span>
          <span className="mt-0.5 block text-ui text-ink-2">
            {price(p.price)}
            {p.compareAtPrice ? <s className="ms-2 text-meta text-ink-3">{price(p.compareAtPrice)}</s> : null}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta">
            <span className={cn('rounded-full px-2 py-0.5 font-bold', STATUS_TONE[p.status])}>{STATUS_AR[p.status]}</span>
            <span className={low ? 'font-bold text-danger' : 'text-ink-3'}>{p.totalStock <= 0 ? 'خلص من المخزون' : `المخزون ${num(p.totalStock)}${low ? ' · قرب يخلص' : ''}`}</span>
            <span className="text-ink-3">{num(p.soldCount)} مبيع</span>
          </span>
        </span>
      </Link>
      <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
        {busy ? <LoaderCircle aria-label="جاري التنفيذ" className="size-5 animate-spin self-center text-ink-3" /> : null}
        <Link href={`/seller/products/${p._id}`} className={iconBtn}>
          <Pencil aria-hidden className="size-4" />
          تعديل
        </Link>
        {p.status === 'DRAFT' ? (
          <button type="button" className={iconBtn} onClick={onPublish} disabled={busy}>
            <Send aria-hidden className="size-4" />
            نشر
          </button>
        ) : null}
        {p.status === 'ARCHIVED' ? (
          <button type="button" className={iconBtn} onClick={onRestore} disabled={busy}>
            <ArchiveRestore aria-hidden className="size-4" />
            رجّعه مسودة
          </button>
        ) : (
          <button type="button" className={cn(iconBtn, 'hover:border-danger hover:text-danger')} onClick={onArchive} disabled={busy} aria-label={`أرشفة ${p.title}`}>
            <Archive aria-hidden className="size-4" />
            <span className="hidden sm:inline">أرشفة</span>
          </button>
        )}
      </div>
    </li>
  );
}
