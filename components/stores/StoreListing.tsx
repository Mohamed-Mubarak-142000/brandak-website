import { Banknote, Check, Search, ShieldCheck, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreGrid } from '@/components/StoreCard';
import { getBrands, getProducts } from '@/lib/api';
import { cn } from '@/lib/cn';
import { STORE_TYPES, storeTypeInfo, type StoreTypeInfo } from '@/lib/store-types';
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

const ALL_POINTS = [
  { icon: ShieldCheck, text: 'كل متجر بنراجعه قبل ما يظهر' },
  { icon: Truck, text: 'توصيل لكل المحافظات' },
  { icon: Banknote, text: 'الدفع كاش عند الاستلام' },
];

const solid = 'inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover';
const outline = 'inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-5 font-bold transition-colors hover:border-brand';

/** The page's banner: the type's icon, name, pitch and how its products are listed. */
function ListingBanner({ info }: { info: StoreTypeInfo | null }) {
  const Icon = info?.icon ?? Store;
  return (
    <header className="grid items-center gap-6 overflow-hidden rounded-window bg-sunken p-6 sm:p-8 md:grid-cols-[1fr_auto] lg:px-12">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-accent shadow-card sm:size-14">
            <Icon aria-hidden className="size-6 sm:size-7" />
          </span>
          <h1 className="text-page font-extrabold sm:text-display">{info ? info.plural : 'كل المتاجر'}</h1>
        </div>
        <p className="mt-3 max-w-2xl text-body text-ink-2">
          {info ? info.pitch : 'براندات ومعارض ومخازن ومحلات مصرية، كل متجر فيهم اتراجع قبل ما يظهر.'}
        </p>
        <ul aria-label={info ? 'إزاي بتتعرض المنتجات هنا' : 'ليه فاترينة'} className="mt-5 flex flex-wrap gap-2">
          {info
            ? info.system.map((line) => (
                <li key={line} className="inline-flex items-start gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-ui text-ink-2">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                  {line}
                </li>
              ))
            : ALL_POINTS.map(({ icon: PointIcon, text }) => (
                <li key={text} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-ui text-ink-2">
                  <PointIcon aria-hidden className="size-4 shrink-0 text-brand" />
                  {text}
                </li>
              ))}
        </ul>
      </div>
      <Image
        src={info ? '/illustrations/store.png' : '/illustrations/brands.png'}
        alt=""
        width={640}
        height={640}
        priority
        sizes="200px"
        className="hidden h-auto w-44 md:block lg:w-52"
      />
    </header>
  );
}

function TypeTabs({ current }: { current?: StoreType }) {
  const tabs = [
    { key: 'ALL', label: 'الكل', path: '/stores', active: !current, icon: Store },
    ...STORE_TYPES.map((t) => ({ key: t.type, label: t.plural, path: t.path, active: t.type === current, icon: t.icon })),
  ];
  return (
    <nav aria-label="أنواع المتاجر" className="rail -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {tabs.map(({ key, label, path, active, icon: Icon }) => (
          <li key={key}>
            <Link
              href={path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-ui font-bold transition-colors',
                active ? 'border-ink bg-ink text-ground' : 'border-line-strong bg-surface text-ink-2 hover:border-brand hover:text-ink',
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
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
  const sortQuery = sort === 'newest' ? undefined : sort;

  const info = type ? storeTypeInfo(type) : null;
  const path = info?.path ?? '/stores';

  const [stores, products] = await Promise.all([
    getBrands({ storeType: type, q: q || undefined, sort, page, limit: LIMIT }),
    type && !q && page === 1 ? getProducts({ storeType: type, sort: 'newest', limit: 10 }) : null,
  ]);
  const has = stores.items.length > 0;
  const count = q
    ? `${countOf(stores.total, 'نتيجة', 'نتايج')} لـ "${q}"`
    : info
      ? countOf(stores.total, info.label, info.plural)
      : countOf(stores.total, 'متجر', 'متاجر');

  return (
    <Container className="pb-16 pt-4 sm:pb-20 sm:pt-6">
      <ListingBanner info={info} />

      <div className="mt-8">
        <TypeTabs current={type} />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:gap-6">
        <form action={path} role="search" className="flex w-full gap-2 lg:max-w-sm">
          {sortQuery ? <input type="hidden" name="sort" value={sortQuery} /> : null}
          <label className="relative flex-1">
            <span className="sr-only">ابحث باسم المتجر</span>
            <Search aria-hidden className="pointer-events-none absolute inset-s-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder={info ? `ابحث في ال${info.plural} بالاسم` : 'ابحث باسم المتجر'}
              className="h-11 w-full rounded-full border border-line-strong bg-surface ps-10 pe-4 text-ui placeholder:text-ink-3 focus:border-brand focus:outline-none"
            />
          </label>
          <button type="submit" className="min-h-11 shrink-0 cursor-pointer rounded-full bg-ink px-5 text-ui font-bold text-ground transition-colors hover:bg-ink-2">
            ابحث
          </button>
        </form>
        {stores.total > 1 ? <SortLinks options={[...SORTS]} current={sort} hrefFor={(s) => hrefWith(path, { q, sort: s === 'newest' ? undefined : s })} /> : null}
        {has ? (
          <p className="text-ui text-ink-3 lg:ms-auto" aria-live="polite">
            {count}
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        {has ? (
          <>
            <StoreGrid stores={stores.items} />
            <Pagination path={path} query={{ q, sort: sortQuery }} page={page} total={stores.total} limit={LIMIT} />
          </>
        ) : q ? (
          <EmptyState
            art="search"
            title={`مفيش متجر اسمه "${q}"`}
            body="جرّب جزء من الاسم أو اكتبه بالإنجليزي، أو دوّر على المنتج نفسه."
            action={
              <>
                <Link href={path} className={solid}>
                  امسح البحث
                </Link>
                <Link href={hrefWith('/search', { q })} className={outline}>
                  دوّر على &quot;{q}&quot; في المنتجات
                </Link>
              </>
            }
          />
        ) : page > 1 ? (
          <EmptyState
            title="الصفحة دي فاضية"
            action={
              <Link href={hrefWith(path, { sort: sortQuery })} className={outline}>
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
              <>
                <Link href="/sell" className={solid}>
                  {info ? `افتح أول ${info.label} على فاترينة` : 'افتح متجرك على فاترينة'}
                </Link>
                {info ? (
                  <Link href="/stores" className={outline}>
                    شوف كل المتاجر
                  </Link>
                ) : null}
              </>
            }
          />
        )}
      </div>

      {info && has && products?.items.length ? (
        <section className="mt-16 sm:mt-20">
          <SectionHeader title={`جديد ال${info.plural}`} body={`آخر المنتجات اللي نزلت في ال${info.plural}.`} href={hrefWith('/search', { storeType: info.type })} linkLabel="كل المنتجات" />
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
