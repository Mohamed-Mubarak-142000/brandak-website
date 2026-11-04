import type { Metadata } from 'next';
import Link from 'next/link';

import { CategoryChips } from '@/components/catalog/CategoryChips';
import { Pagination } from '@/components/catalog/Pagination';
import { one, pageParam, sortParam, type SearchParams } from '@/components/catalog/params';
import { SortLinks } from '@/components/catalog/SortLinks';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { SearchForm } from '@/components/Header';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreGrid } from '@/components/StoreCard';
import { getBrands, getCategories, getProducts } from '@/lib/api';
import { num } from '@/lib/format';

const LIMIT = 24;

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams).q);
  return {
    title: q ? `نتايج البحث عن "${q}"` : 'ابحث في فاترينة',
    robots: { index: false, follow: true },
  };
}

async function EmptyQuery() {
  const [categories, newest] = await Promise.all([getCategories(), getProducts({ sort: 'newest', limit: 10 })]);
  const sections = categories.filter((c) => (c.level ?? (c.parentId ? 1 : 0)) === 0 && c.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <p className="mt-6 text-body text-ink-2">اكتب اسم المنتج أو المتجر، أو ابدأ من قسم.</p>
      {sections.length ? (
        <section aria-labelledby="sections-title" className="mt-6">
          <h2 id="sections-title" className="mb-3 text-section font-extrabold">
            الأقسام
          </h2>
          <CategoryChips categories={sections} label="الأقسام" />
        </section>
      ) : null}
      {newest.items.length ? (
        <section className="mt-12">
          <SectionHeader title="أحدث المنتجات" />
          <ProductGrid products={newest.items} />
        </section>
      ) : null}
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = one(sp.q);

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-page font-extrabold">{q ? <>نتايج البحث عن &quot;{q}&quot;</> : 'ابحث في فاترينة'}</h1>
      <SearchForm key={q ?? ''} defaultValue={q} className="mt-4 max-w-xl" />
      {q ? <Results q={q} sp={sp} /> : <EmptyQuery />}
    </Container>
  );
}

async function Results({ q, sp }: { q: string; sp: SearchParams }) {
  const page = pageParam(sp);
  const sort = sortParam(sp);
  const [stores, products] = await Promise.all([page === 1 ? getBrands({ q, limit: 6 }) : Promise.resolve(null), getProducts({ q, sort, page, limit: LIMIT })]);

  if (!products.items.length && !stores?.items.length) {
    return (
      <div className="mt-8">
        <EmptyState
          art="search"
          title={page > 1 ? 'مفيش نتايج تانية' : `ملقيناش حاجة عن "${q}"`}
          body="جرّب كلمة أقصر أو أعم (مثلًا «تيشيرت» بدل «تيشيرت قطن أبيض»)، واتأكد من الإملا، أو دوّر بالعربي لو كتبت بالإنجليزي."
          action={
            <Link href="/search" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
              تصفّح الأقسام
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      {stores?.items.length ? (
        <section aria-labelledby="stores-title" className="mt-8">
          <h2 id="stores-title" className="mb-4 text-section font-extrabold">
            متاجر <span className="text-body font-semibold text-ink-3">({num(stores.total)})</span>
          </h2>
          <StoreGrid stores={stores.items} />
        </section>
      ) : null}

      <section aria-labelledby="products-title" className="mt-10">
        <h2 id="products-title" className="mb-4 text-section font-extrabold">
          {num(products.total)} منتج
        </h2>
        {products.items.length ? (
          <>
            <SortLinks path="/search" searchParams={sp} current={sort} />
            <ProductGrid products={products.items} priorityCount={4} />
            <Pagination path="/search" searchParams={sp} page={page} total={products.total} limit={products.limit || LIMIT} />
          </>
        ) : (
          <p className="text-ui text-ink-2">مفيش منتجات بالاسم ده، بس فيه متاجر ممكن تلاقي عندها اللي بتدوّر عليه.</p>
        )}
      </section>
    </>
  );
}
