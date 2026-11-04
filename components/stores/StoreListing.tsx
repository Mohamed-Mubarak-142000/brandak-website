import clsx from 'clsx';
import { Check, Search } from 'lucide-react';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreGrid } from '@/components/StoreCard';
import { getBrands, getProducts } from '@/lib/api';
import { num } from '@/lib/format';
import { STORE_TYPES, storeTypeInfo } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

import { hrefWith, pageParam, Pagination, stringParam } from './Pagination';
import { SortLinks } from './SortLinks';
import { countOf } from './words';

const LIMIT = 24;
const SORTS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'rating', label: 'الأعلى تقييمًا' },
  { value: 'name', label: 'بالاسم' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

export type ListingSearchParams = Promise<Record<string, string | string[] | undefined>>;

function TypeTabs({ current }: { current?: StoreType }) {
  const tabs = [{ key: 'ALL', label: 'الكل', path: '/stores', active: !current }, ...STORE_TYPES.map((t) => ({ key: t.type, label: t.plural, path: t.path, active: t.type === current }))];
  return (
    <nav aria-label="أنواع المتاجر" className="rail -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {tabs.map((t) => (
          <li key={t.key}>
            <Link
              href={t.path}
              aria-current={t.active ? 'page' : undefined}
              className={clsx(
                '-mb-px flex min-h-11 items-center border-b-[3px] px-4 text-ui font-bold transition-colors',
                t.active ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink',
              )}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The store directory, shared by /stores (every type) and /brands, /showrooms, /warehouses,
 * /shops. Search, sort and paging all live in the URL so every state is a shareable link.
 */
export async function StoreListing({ type, searchParams }: { type?: StoreType; searchParams: ListingSearchParams }) {
  const sp = await searchParams;
  const q = stringParam(sp.q);
  const rawSort = stringParam(sp.sort);
  const sort: Sort = SORTS.some((s) => s.value === rawSort) ? (rawSort as Sort) : 'newest';
  const page = pageParam(sp.page);

  const info = type ? storeTypeInfo(type) : null;
  const path = info?.path ?? '/stores';

  const [stores, products] = await Promise.all([
    getBrands({ storeType: type, q: q || undefined, sort, page, limit: LIMIT }),
    type && !q && page === 1 ? getProducts({ storeType: type, sort: 'newest', limit: 5 }) : null,
  ]);
  const has = stores.items.length > 0;

  return (
    <Container className="pt-8 sm:pt-12">
      <header className="max-w-3xl">
        <h1 className="font-sign text-page sm:text-display">{info ? info.plural : 'كل المتاجر'}</h1>
        <p className="mt-2 text-body text-ink-2">
          {info ? info.pitch : 'براندات ومعارض ومخازن ومحلات مصرية، كل متجر فيهم اتراجع قبل ما يظهر.'}
        </p>
      </header>

      {info ? (
        <section aria-labelledby="system-title" className="mt-6 max-w-3xl rounded-panel bg-sunken p-5">
          <h2 id="system-title" className="text-ui font-extrabold">
            إزاي بتتعرض المنتجات هنا
          </h2>
          <ul className="mt-3 space-y-2">
            {info.system.map((line) => (
              <li key={line} className="flex gap-2 text-ui text-ink-2">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                {line}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8">
        <TypeTabs current={type} />
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form action={path} role="search" className="flex w-full gap-2 lg:max-w-md">
          {sort !== 'newest' ? <input type="hidden" name="sort" value={sort} /> : null}
          <label className="relative flex-1">
            <span className="sr-only">ابحث باسم المتجر</span>
            <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder={info ? `ابحث في ال${info.plural} بالاسم` : 'ابحث باسم المتجر'}
              className="h-11 w-full rounded-full border border-line-strong bg-surface ps-10 pe-4 text-ui placeholder:text-ink-3 focus:border-brand focus:outline-none"
            />
          </label>
          <button type="submit" className="min-h-11 shrink-0 rounded-full border border-line-strong bg-surface px-5 text-ui font-bold hover:border-brand">
            ابحث
          </button>
        </form>
        {has ? <SortLinks options={[...SORTS]} current={sort} hrefFor={(s) => hrefWith(path, { q, sort: s === 'newest' ? undefined : s })} /> : null}
      </div>

      <div className="mt-8">
        {has ? (
          <>
            <p className="mb-4 text-meta text-ink-3" aria-live="polite">
              {q ? `${countOf(stores.total, 'نتيجة', 'نتايج')} لـ "${q}"` : info ? countOf(stores.total, info.label, info.plural) : `${num(stores.total)} متجر`}
            </p>
            <StoreGrid stores={stores.items} />
            <Pagination path={path} query={{ q, sort: sort === 'newest' ? undefined : sort }} page={page} total={stores.total} limit={LIMIT} />
          </>
        ) : q ? (
          <EmptyState
            art="search"
            title={`مفيش متجر اسمه "${q}"`}
            body="جرّب جزء من الاسم أو اكتبه بالإنجليزي، أو دوّر على المنتج نفسه."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={path} className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
                  امسح البحث
                </Link>
                <Link href={hrefWith('/search', { q })} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand">
                  دوّر على &quot;{q}&quot; في المنتجات
                </Link>
              </div>
            }
          />
        ) : page > 1 ? (
          <EmptyState
            art="empty"
            title="الصفحة دي فاضية"
            action={
              <Link href={hrefWith(path, { sort: sort === 'newest' ? undefined : sort })} className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                ارجع لأول صفحة
              </Link>
            }
          />
        ) : (
          <EmptyState
            art="store"
            title={info ? `لسه مفيش ${info.plural} على فاترينة` : 'لسه مفيش متاجر على فاترينة'}
            body={info ? `عندك ${info.label}؟ افتحه على فاترينة ببلاش وخلّي عملاء من كل المحافظات يشوفوا منتجاتك.` : 'المتاجر الأولى بتتراجع دلوقتي. عندك متجر؟ افتحه ببلاش.'}
            action={
              <Link href="/sell" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
                {info ? `افتح أول ${info.label} على فاترينة` : 'افتح متجرك على فاترينة'}
              </Link>
            }
          />
        )}
      </div>

      {info && has && products?.items.length ? (
        <section className="mt-16">
          <SectionHeader title={`جديد ال${info.plural}`} />
          <ProductGrid products={products.items} />
        </section>
      ) : null}
    </Container>
  );
}

/** Metadata for a listing page; search and later pages aren't indexed separately. */
export function listingMetadata(type?: StoreType) {
  const info = type ? storeTypeInfo(type) : null;
  return {
    title: info ? info.seo.title : 'كل المتاجر',
    description: info ? info.seo.description : 'براندات ومعارض ومخازن ومحلات مصرية على فاترينة: اتفرّج على فاترينة كل متجر، والدفع عند الاستلام.',
    alternates: { canonical: info?.path ?? '/stores' },
  };
}
