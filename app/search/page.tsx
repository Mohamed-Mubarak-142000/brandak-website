import type { Metadata } from 'next';
import Link from 'next/link';

import { CategoryChips } from '@/components/catalog/CategoryChips';
import { activeFilters } from '@/components/catalog/Filters';
import { one, pageParam, readFilters, type SearchParams } from '@/components/catalog/params';
import { ProductListing } from '@/components/catalog/ProductListing';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { SearchForm } from '@/components/Header';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreLogo } from '@/components/StoreCard';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { getBrands, getCategories, getProducts } from '@/lib/api';
import { num } from '@/lib/format';
import type { PublicBrand } from '@/lib/types';

const LIMIT = 24;

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams).q);
  return {
    title: q ? `نتايج البحث عن "${q}"` : 'ابحث في فاترينة',
    robots: { index: false, follow: true },
  };
}

const primary = 'inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover';

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = one(sp.q);

  return (
    <>
      <div className="border-b border-line bg-sunken">
        <Container className="py-8 sm:py-10">
          <h1 className="text-page font-extrabold sm:text-display">{q ? <>نتايج البحث عن &quot;{q}&quot;</> : 'دوّر في فاترينة'}</h1>
          {!q ? <p className="mt-1 text-ui text-ink-2 sm:text-body">اكتب اسم المنتج أو المتجر، أو ابدأ من قسم.</p> : null}
          <SearchForm key={q ?? ''} defaultValue={q} size="lg" className="mt-5 max-w-2xl" />
        </Container>
      </div>
      <Container className="py-8 sm:py-10">{q ? <Results q={q} sp={sp} /> : <EmptyQuery />}</Container>
    </>
  );
}

async function EmptyQuery() {
  const [categories, newest] = await Promise.all([getCategories(), getProducts({ sort: 'newest', limit: 10 })]);
  const sections = categories.filter((c) => (c.level ?? (c.parentId ? 1 : 0)) === 0 && c.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  if (!sections.length && !newest.items.length) {
    return <EmptyState art="search" title="مش قادرين نجيب الأقسام دلوقتي" body="جرّب تدوّر بكلمة، أو ارجع بعد شوية." />;
  }
  return (
    <div className="space-y-14">
      {sections.length ? (
        <section>
          <SectionHeader title="الأقسام" body="ابدأ من القسم اللي يهمك." />
          <CategoryChips categories={sections.slice(0, 12)} label="الأقسام" layout="tiles" />
        </section>
      ) : null}
      {newest.items.length ? (
        <section>
          <SectionHeader title="أحدث المنتجات" body="آخر حاجات نزلت من المتاجر." />
          <ProductGrid products={newest.items} />
        </section>
      ) : null}
    </div>
  );
}

/** Matching stores as a compact row: logo, name, type. */
function StoreRow({ stores, total }: { stores: PublicBrand[]; total: number }) {
  return (
    <section aria-labelledby="stores-title" className="mb-10">
      <h2 id="stores-title" className="mb-4 text-section font-extrabold">
        متاجر <span className="text-ui font-semibold text-ink-3">({num(total)})</span>
      </h2>
      <ul className="rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        {stores.map((s) => (
          <li key={s.id} className="shrink-0">
            <Link
              href={`/brand/${s.slug}`}
              className="group flex w-64 items-center gap-3 rounded-card border border-line bg-surface p-3 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card"
            >
              <StoreLogo store={s} size={52} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ui font-extrabold transition-colors group-hover:text-accent">{s.name}</span>
                <StoreTypeBadge type={s.storeType} className="mt-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Results({ q, sp }: { q: string; sp: SearchParams }) {
  const page = pageParam(sp);
  const filters = readFilters(sp);
  const filtered = activeFilters(filters).length > 0;
  const [stores, products] = await Promise.all([
    page === 1 && !filtered ? getBrands({ q, limit: 8 }) : Promise.resolve(null),
    getProducts({ q, ...filters, page, limit: LIMIT }),
  ]);
  const clearHref = `/search?q=${encodeURIComponent(q)}`;

  if (!products.items.length && !stores?.items.length && !filtered) {
    return (
      <EmptyState
        art="search"
        title={page > 1 ? 'مفيش نتايج تانية' : `ملقيناش حاجة عن "${q}"`}
        body="جرّب كلمة أقصر أو أعم (مثلًا «تيشيرت» بدل «تيشيرت قطن أبيض»)، واتأكد من الإملا، أو دوّر بالعربي لو كتبت بالإنجليزي."
        action={
          <Link href="/search" className={primary}>
            تصفّح الأقسام
          </Link>
        }
      />
    );
  }

  return (
    <>
      {stores?.items.length ? <StoreRow stores={stores.items} total={stores.total} /> : null}
      <section aria-label="المنتجات">
        <ProductListing
          path="/search"
          searchParams={sp}
          filters={filters}
          keep={{ q }}
          clearHref={clearHref}
          items={products.items}
          total={products.total}
          page={page}
          limit={products.limit || LIMIT}
          empty={
            filtered || page > 1 ? (
              <EmptyState
                art="search"
                title="مفيش منتجات بالفلاتر دي"
                body="جرّب توسّع نطاق السعر أو تشيل فلتر أو اتنين."
                action={
                  <Link href={clearHref} className={primary}>
                    امسح الفلاتر
                  </Link>
                }
              />
            ) : (
              <p className="rounded-panel border border-line bg-sunken p-5 text-ui text-ink-2">مفيش منتجات بالاسم ده، بس فيه متاجر فوق ممكن تلاقي عندها اللي بتدوّر عليه.</p>
            )
          }
        />
      </section>
    </>
  );
}
