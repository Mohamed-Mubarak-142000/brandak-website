import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { CategoryChips } from '@/components/catalog/CategoryChips';
import { activeFilters, Filters } from '@/components/catalog/Filters';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, readFilters, type SearchParams } from '@/components/catalog/params';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { ProductGrid } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/api';
import { num } from '@/lib/format';
import { appPath } from '@/lib/links';

const LIMIT = 24;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

async function findCategory(id: string) {
  const all = await getCategories();
  return { all, category: all.find((c) => c._id === id) ?? null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { category } = await findCategory(id);
  if (!category) return { title: 'القسم مش موجود' };
  return {
    title: category.nameAr,
    description: `تسوّق ${category.nameAr} من براندات ومعارض ومخازن ومحلات مصرية على فاترينة. أسعار واضحة، توصيل لكل المحافظات، والدفع عند الاستلام.`,
    alternates: { canonical: `/category/${category._id}` },
    openGraph: { type: 'website', title: category.nameAr },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { all, category } = await findCategory(id);
  if (!category) notFound();

  const path = `/category/${category._id}`;
  const page = pageParam(sp);
  const filters = readFilters(sp, category.storeTypes);
  const { items, total, limit } = await getProducts({ categoryId: category._id, ...filters, page, limit: LIMIT });

  const byId = new Map(all.map((c) => [c._id, c]));
  const ancestors = (category.ancestors ?? []).map((a) => byId.get(a)).filter((c) => c !== undefined);
  const children = all.filter((c) => c.parentId === category._id && c.isActive !== false).sort((a, b) => a.sortOrder - b.sortOrder);
  const filtered = activeFilters(filters).length > 0;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, ...ancestors.map((a) => ({ label: a.nameAr, href: `/category/${a._id}` })), { label: category.nameAr }]} />

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="text-page font-extrabold sm:font-sign sm:text-display sm:font-normal">{category.nameAr}</h1>
        {total > 0 ? <p className="text-ui text-ink-2">{num(total)} منتج</p> : null}
      </div>

      {children.length ? (
        <div className="mt-5">
          <CategoryChips categories={children} label={`أقسام ${category.nameAr}`} />
        </div>
      ) : null}

      <div className="mt-8">
        <Filters path={path} searchParams={sp} filters={filters} storeTypes={category.storeTypes} />
      </div>

      {items.length ? (
        <>
          <ProductGrid products={items} priorityCount={4} />
          <Pagination path={path} searchParams={sp} page={page} total={total} limit={limit || LIMIT} />
        </>
      ) : filtered || page > 1 ? (
        <EmptyState
          art="search"
          title="مفيش منتجات بالفلاتر دي"
          body="جرّب توسّع نطاق السعر أو تشيل فلتر أو اتنين."
          action={
            <Link href={path} className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
              امسح الفلاتر
            </Link>
          }
        />
      ) : (
        <EmptyState
          art="box"
          title={`لسه مفيش منتجات في ${category.nameAr}`}
          body="المتاجر لسه بتضيف منتجاتها هنا. بص على الأقسام التانية، أو افتح القسم في التطبيق."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
                شوف كل الأقسام
              </Link>
              <OpenInApp path={appPath.category(category._id)} variant="secondary">
                افتح القسم في التطبيق
              </OpenInApp>
            </div>
          }
        />
      )}
    </Container>
  );
}
