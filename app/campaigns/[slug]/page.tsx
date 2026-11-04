import { CalendarClock, Clock, Percent } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs';
import { safeColor, timeLeft, tint } from '@/components/catalog/CampaignCard';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, type SearchParams } from '@/components/catalog/params';
import { Container } from '@/components/Container';
import { EmptyState } from '@/components/EmptyState';
import { OpenInApp } from '@/components/OpenInApp';
import { ProductGrid } from '@/components/ProductCard';
import { getCampaign, getProducts } from '@/lib/api';
import { cn } from '@/lib/cn';
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
  const left = timeLeft(campaign);
  const ended = left.state === 'ended';
  const path = `/campaigns/${campaign.slug}`;
  const color = safeColor(campaign.color);

  return (
    <>
      <div className="border-b border-line" style={{ background: tint(color, 12) }}>
        <Container className="py-6 sm:py-10">
          <Breadcrumbs items={[{ label: 'الرئيسية', href: '/' }, { label: 'العروض', href: '/offers' }, { label: campaign.nameAr }]} />
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-2xl">
              <span className="mb-4 grid size-12 place-items-center rounded-full bg-surface shadow-card" style={{ color }}>
                <Percent aria-hidden className="size-6" />
              </span>
              <h1 className="text-page font-extrabold sm:text-display">{campaign.nameAr}</h1>
              {campaign.descriptionAr ? <p className="mt-2 whitespace-pre-line text-body text-ink-2">{campaign.descriptionAr}</p> : null}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-ui">
                <span
                  className={cn(
                    'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-bold',
                    ended ? 'bg-surface text-ink-3' : 'bg-ink text-ground',
                  )}
                >
                  <Clock aria-hidden className="size-4" />
                  {left.text}
                </span>
                {!ended ? (
                  <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface px-3 font-semibold text-ink-2">
                    <CalendarClock aria-hidden className="size-4" />
                    من {date(campaign.startsAt)} لحد {date(campaign.endsAt)}
                  </span>
                ) : null}
                {campaign.minPercent > 0 ? (
                  <span className="inline-flex min-h-9 items-center rounded-full bg-surface px-3 font-extrabold text-danger">خصم {num(campaign.minPercent)}٪ وأكتر</span>
                ) : null}
              </div>
            </div>
            <OpenInApp path={appPath.offers} className="shrink-0 self-start sm:self-auto">
              كوبونات التطبيق
            </OpenInApp>
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        {products.items.length ? (
          <>
            <p className="mb-5 text-ui text-ink-2">
              <strong className="font-extrabold text-ink">{num(products.total)}</strong> منتج في العرض
            </p>
            <ProductGrid products={products.items} priorityCount={5} />
            <Pagination path={path} searchParams={sp} page={page} total={products.total} limit={products.limit || LIMIT} />
          </>
        ) : (
          <EmptyState
            art="box"
            title={ended ? 'العرض ده خلص' : 'لسه مفيش منتجات في العرض ده'}
            body={ended ? 'بص على العروض الشغالة دلوقتي.' : 'المتاجر بتضيف منتجاتها للعرض. ارجع بعد شوية، أو شوف العروض التانية.'}
            action={
              <>
                <Link href="/offers" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover">
                  كل العروض
                </Link>
                <OpenInApp path={appPath.offers} variant="secondary">
                  عروض التطبيق
                </OpenInApp>
              </>
            }
          />
        )}
      </Container>
    </>
  );
}
