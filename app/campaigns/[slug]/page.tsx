import { CalendarClock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { safeColor } from '@/components/catalog/CampaignCard';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, type SearchParams } from '@/components/catalog/params';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { ProductGrid } from '@/components/ProductCard';
import { getCampaign, getProducts } from '@/lib/api';
import { date, excerpt, num } from '@/lib/format';
import { appPath } from '@/lib/links';

const LIMIT = 24;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) return { title: 'العرض مش موجود' };
  return {
    title: campaign.nameAr,
    description: excerpt(campaign.descriptionAr || `${campaign.nameAr}: خصومات من متاجر فاترينة لحد ${date(campaign.endsAt)}.`),
    alternates: { canonical: `/campaigns/${campaign.slug}` },
  };
}

export default async function CampaignPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const campaign = await getCampaign(slug);
  if (!campaign) notFound();

  const page = pageParam(sp);
  const products = await getProducts({ campaignId: campaign._id, page, limit: LIMIT });
  const ended = new Date(campaign.endsAt).getTime() < new Date().getTime();
  const path = `/campaigns/${campaign.slug}`;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, { label: 'العروض', href: '/offers' }, { label: campaign.nameAr }]} />

      <header className="mt-4 overflow-hidden rounded-panel border border-line bg-surface">
        <div aria-hidden className="h-3" style={{ background: safeColor(campaign.color) }} />
        <div className="p-5 sm:p-8">
          <h1 className="text-page font-extrabold sm:font-sign sm:text-display sm:font-normal">{campaign.nameAr}</h1>
          {campaign.descriptionAr ? <p className="mt-2 max-w-2xl whitespace-pre-line text-body text-ink-2">{campaign.descriptionAr}</p> : null}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-ui">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <CalendarClock aria-hidden className="size-4 text-accent" />
              {ended ? `خلص في ${date(campaign.endsAt)}` : `من ${date(campaign.startsAt)} لحد ${date(campaign.endsAt)}`}
            </span>
            {campaign.minPercent > 0 ? <span className="rounded-full bg-danger-soft px-3 py-0.5 font-bold text-danger">خصم {num(campaign.minPercent)}٪ وأكتر</span> : null}
          </div>
        </div>
      </header>

      <div className="mt-10">
        {products.items.length ? (
          <>
            <p className="mb-4 text-ui text-ink-2">{num(products.total)} منتج في العرض</p>
            <ProductGrid products={products.items} priorityCount={4} />
            <Pagination path={path} searchParams={sp} page={page} total={products.total} limit={products.limit || LIMIT} />
          </>
        ) : (
          <EmptyState
            art="box"
            title={ended ? 'العرض ده خلص' : 'لسه مفيش منتجات في العرض ده'}
            body={ended ? 'بص على العروض الشغالة دلوقتي.' : 'المتاجر بتضيف منتجاتها للعرض. ارجع بعد شوية، أو شوف العروض التانية.'}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/offers" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
                  كل العروض
                </Link>
                <OpenInApp path={appPath.offers} variant="secondary">
                  عروض التطبيق
                </OpenInApp>
              </div>
            }
          />
        )}
      </div>
    </Container>
  );
}
