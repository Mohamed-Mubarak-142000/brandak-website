import { Coins } from 'lucide-react';
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
    <Container className="py-8 sm:py-10">
      <SectionHeader as="h1" title="العروض" body="الخصومات الشغالة دلوقتي من كل المتاجر، الأكبر خصم الأول." />

      <aside className="mb-10 flex flex-col gap-4 rounded-panel border border-line bg-sunken p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="flex items-start gap-3 text-ui font-semibold">
          <Coins aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
          كوبونات المتاجر ونقاط فاترينة بتتصرف في التطبيق بس.
        </p>
        <OpenInApp path={appPath.offers} variant="secondary" className="shrink-0">
          شوف عروض التطبيق
        </OpenInApp>
      </aside>

      {running.length ? (
        <section aria-labelledby="campaigns-title" className="mb-12">
          <h2 id="campaigns-title" className="mb-4 text-section font-extrabold">
            حملات شغالة
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {running.map((c) => (
              <li key={c._id}>
                <CampaignCard campaign={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {products.items.length ? (
        <section aria-labelledby="sale-title">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="sale-title" className="text-section font-extrabold">
              منتجات عليها خصم
            </h2>
            <p className="text-ui text-ink-2">{num(products.total)} منتج</p>
          </div>
          <ProductGrid products={products.items} priorityCount={4} />
          <Pagination path="/offers" searchParams={sp} page={page} total={products.total} limit={products.limit || LIMIT} />
        </section>
      ) : (
        <EmptyState
          art="box"
          title="مفيش عروض شغالة دلوقتي"
          body="المتاجر بتنزّل خصومات كل فترة. لحد ما ده يحصل، شوف أحدث المنتجات."
          action={
            <Link href="/search" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
              أحدث المنتجات
            </Link>
          }
        />
      )}
    </Container>
  );
}
