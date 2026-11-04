import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createElement } from 'react';

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { CategoryChips } from '@/components/catalog/CategoryChips';
import { activeFilters } from '@/components/catalog/Filters';
import { pageParam, readFilters, type SearchParams } from '@/components/catalog/params';
import { ProductListing } from '@/components/catalog/ProductListing';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { getCategories, getProducts } from '@/lib/api';
import { categoryIcon } from '@/lib/category-icons';
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

const primary = 'inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover';

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
  const icon = createElement(categoryIcon(category.icon ?? ancestors[0]?.icon), { 'aria-hidden': true, className: 'size-7' });

  const empty =
    filtered || page > 1 ? (
      <EmptyState
        art="search"
        title="مفيش منتجات بالفلاتر دي"
        body="جرّب توسّع نطاق السعر أو تشيل فلتر أو اتنين."
        action={
          <Link href={path} className={primary}>
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
          <>
            <Link href="/" className={primary}>
              شوف كل الأقسام
            </Link>
            <OpenInApp path={appPath.category(category._id)} variant="secondary">
              افتح القسم في التطبيق
            </OpenInApp>
          </>
        }
      />
    );

  return (
    <>
      <div className="border-b border-line bg-sunken">
        <Container className="py-6 sm:py-8">
          <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, ...ancestors.map((a) => ({ label: a.nameAr, href: `/category/${a._id}` })), { label: category.nameAr }]} />
          <div className="mt-4 flex items-center gap-4">
            <span className="hidden size-14 shrink-0 place-items-center rounded-panel border border-line bg-surface text-accent sm:grid">
              {icon}
            </span>
            <div className="min-w-0">
              <h1 className="text-page font-extrabold sm:text-display">{category.nameAr}</h1>
              <p className="mt-1 text-ui text-ink-2">
                {total > 0 ? `${num(total)} منتج من متاجر فاترينة، والدفع عند الاستلام` : 'من براندات ومعارض ومخازن ومحلات مصرية'}
              </p>
            </div>
          </div>
          {children.length ? (
            <div className="mt-5">
              <CategoryChips categories={children} label={`أقسام ${category.nameAr}`} />
            </div>
          ) : null}
        </Container>
      </div>

      <Container className="py-6 sm:py-8">
        <ProductListing
          path={path}
          searchParams={sp}
          filters={filters}
          storeTypes={category.storeTypes}
          clearHref={path}
          items={items}
          total={total}
          page={page}
          limit={limit || LIMIT}
          empty={empty}
        />
      </Container>
    </>
  );
}
