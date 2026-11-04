import { BadgePercent, Coins, TicketPercent } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CampaignCard } from '@/components/catalog/CampaignCard';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, type SearchParams } from '@/components/catalog/params';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { ProductGrid } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { getCampaigns, getProducts } from '@/lib/api';
import { num } from '@/lib/format';
import { appPath } from '@/lib/links';

const LIMIT = 24;

export const metadata: Metadata = {
  title: 'العروض والخصومات',
  description: 'كل الخصومات الشغالة دلوقتي على فاترينة من براندات ومعارض ومخازن ومحلات مصرية، والدفع عند الاستلام.',
  alternates: { canonical: '/offers' },
};

export default async function OffersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = pageParam(sp);
  const [campaigns, products] = await Promise.all([getCampaigns(), getProducts({ onSale: true, sort: 'discount', page, limit: LIMIT })]);
  const now = new Date().toISOString();
  const running = campaigns.filter((c) => c.endsAt > now && c.startsAt <= now);

  return (
    <Container className="py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-window border border-brand/15 bg-accent-soft px-5 py-8 sm:px-10 sm:py-12">
        <BadgePercent aria-hidden className="pointer-events-none absolute -inset-e-6 -bottom-8 size-48 text-brand/10 sm:size-64" />
        <div className="relative max-w-2xl">
          <h1 className="text-page font-extrabold sm:text-display">عروض النهارده</h1>
          <p className="mt-2 text-body text-ink-2">
            الخصومات الشغالة دلوقتي من كل المتاجر، الأكبر خصم الأول.
            {products.total > 0 ? ` ${num(products.total)} منتج عليه خصم.` : null}
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <OpenInApp path={appPath.offers} className="min-h-12 px-6">
              عروض التطبيق
            </OpenInApp>
            <p className="flex items-start gap-2 text-ui font-semibold text-ink-2">
              <Coins aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              كوبونات المتاجر ونقاط فاترينة بتستخدمها وانت بتأكد الطلب، هنا على الموقع أو في التطبيق.
            </p>
          </div>
        </div>
      </section>

      {running.length ? (
        <section className="mt-12">
          <SectionHeader title="حملات شغالة" body="عروض المواسم، كل حملة فيها منتجات من أكتر من متجر." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {running.map((c) => (
              <li key={c._id}>
                <CampaignCard campaign={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="sale-title" className="mt-12">
        {products.items.length ? (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2 sm:mb-6">
              <h2 id="sale-title" className="text-section font-extrabold sm:text-page">
                منتجات عليها خصم
              </h2>
              <p className="text-ui text-ink-2">
                <strong className="font-extrabold text-ink">{num(products.total)}</strong> منتج، الأكبر خصم الأول
              </p>
            </div>
            <ProductGrid products={products.items} priorityCount={5} />
            <Pagination path="/offers" searchParams={sp} page={page} total={products.total} limit={products.limit || LIMIT} />
          </>
        ) : (
          <>
            <h2 id="sale-title" className="sr-only">
              منتجات عليها خصم
            </h2>
            <EmptyState
              art="box"
              title={page > 1 ? 'مفيش عروض تانية' : 'مفيش خصومات شغالة دلوقتي'}
              body="المتاجر بتنزّل خصومات كل فترة، وكوبونات المتاجر ونقاط فاترينة تقدر تستخدمها في أي طلب، هنا أو في التطبيق."
              action={
                <>
                  <Link href="/search" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover">
                    أحدث المنتجات
                  </Link>
                  <OpenInApp path={appPath.offers} variant="secondary">
                    <TicketPercent aria-hidden className="size-4" />
                    افتح العروض في التطبيق
                  </OpenInApp>
                </>
              }
            />
          </>
        )}
      </section>
    </Container>
  );
}
