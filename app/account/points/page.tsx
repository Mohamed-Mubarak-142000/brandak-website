import { Coins, Info } from 'lucide-react';
import type { Metadata } from 'next';

import { LoadError, PageTitle, Panel } from '@/components/account/PageTitle';
import { Pagination } from '@/components/catalog/Pagination';
import { pageParam, type SearchParams } from '@/components/catalog/params';
import { cn } from '@/lib/cn';
import { date, num, price } from '@/lib/format';
import { authed, requireSession } from '@/lib/session';

export const metadata: Metadata = { title: 'نقاطي', robots: { index: false, follow: false } };

interface PointsSummary {
  balance: number;
  value: number;
  pointValue: number;
  earnPerEgp: number;
  minRedeem: number;
  maxRedeemShare: number;
}
interface PointsEntry {
  _id: string;
  type: 'EARN' | 'REDEEM' | 'REFUND' | 'REVERSAL' | 'ADJUSTMENT';
  points: number;
  orderNumber?: string;
  createdAt: string;
}

const TYPE_AR: Record<PointsEntry['type'], string> = {
  EARN: 'كسبتها من طلب',
  REDEEM: 'استخدمتها في طلب',
  REFUND: 'رجعتلك من طلب اتلغى',
  REVERSAL: 'اتشالت بسبب مرتجع',
  ADJUSTMENT: 'تسوية',
};

const LIMIT = 20;

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <Info aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
      <span>{children}</span>
    </li>
  );
}

/** Fatrina points: earned on every delivered order, spent as a discount at any store. */
export default async function PointsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = pageParam(sp);
  const session = await requireSession(page > 1 ? `/account/points?page=${page}` : '/account/points');
  const [summary, history] = await Promise.all([
    authed<PointsSummary>('points/me', session.token),
    authed<PointsEntry[]>('points/me/history', session.token, { search: `?page=${page}&limit=${LIMIT}` }),
  ]);

  if (!summary.ok || !summary.data) {
    return (
      <>
        <PageTitle title="نقاطي" />
        <LoadError what="نقاطك" retryHref="/account/points" />
      </>
    );
  }
  const s = summary.data;
  const rows = history.ok ? (history.data ?? []) : [];
  const total = Number(history.meta?.total ?? rows.length);
  const perPoint = s.earnPerEgp > 0 ? Math.round(1 / s.earnPerEgp) : null;

  return (
    <>
      <PageTitle title="نقاطي" body="نقاط فاترينة بتتجمع مع كل طلب يتسلّم، وتخصمها من أي متجر." />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-label="رصيدك" className="flex flex-col items-center justify-center rounded-panel border border-line bg-surface px-5 py-8 text-center">
          <Coins aria-hidden className="size-10 text-brand" />
          <p className="mt-2 text-display font-extrabold leading-none">{num(s.balance)}</p>
          <p className="mt-1 text-ui font-bold text-ink-2">نقطة</p>
          <p className="mt-3 rounded-full bg-success-soft px-3 py-1 text-ui font-semibold text-success">تساوي {price(s.value)} خصم</p>
        </section>

        <Panel title="إزاي النقاط بتشتغل؟">
          <ul className="space-y-2.5 text-ui text-ink-2">
            {perPoint ? <Fact>كل {price(perPoint)} في طلب بيتسلّم = نقطة.</Fact> : null}
            <Fact>كل نقطة بـ {price(s.pointValue)}، وتنفع في أي متجر على فاترينة.</Fact>
            <Fact>
              تقدر تستخدمها من {num(s.minRedeem)} نقطة، ولحد {num(Math.round(s.maxRedeemShare * 100))}٪ من قيمة المنتجات، من صفحة إتمام الطلب.
            </Fact>
            <Fact>لو الطلب اتلغى النقاط بترجعلك، ولو المنتج رجع النقاط اللي كسبتها منه بتتشال.</Fact>
          </ul>
        </Panel>
      </div>

      <h2 className="mt-8 mb-4 text-section font-extrabold">السجل</h2>
      {!history.ok ? (
        <LoadError what="سجل النقاط" retryHref="/account/points" />
      ) : !rows.length ? (
        <p className="rounded-panel border border-line bg-surface px-5 py-8 text-center text-ui text-ink-2">لسه مفيش حركة. أول طلب يتسلّم هيجيبلك نقاط.</p>
      ) : (
        <>
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface px-4 sm:px-5">
            {rows.map((e) => (
              <li key={e._id} className="flex min-h-14 items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-ui font-semibold">{TYPE_AR[e.type] ?? e.type}</p>
                  <p className="text-meta text-ink-3">
                    {e.orderNumber ? <bdi dir="ltr">#{e.orderNumber}</bdi> : null}
                    {e.orderNumber ? ' · ' : null}
                    {date(e.createdAt)}
                  </p>
                </div>
                <bdi dir="ltr" className={cn('shrink-0 text-body font-extrabold', e.points > 0 ? 'text-success' : 'text-ink-2')}>
                  {e.points > 0 ? `+${num(e.points)}` : num(e.points)}
                </bdi>
              </li>
            ))}
          </ul>
          <Pagination path="/account/points" searchParams={sp} page={page} total={total} limit={LIMIT} />
        </>
      )}
    </>
  );
}
