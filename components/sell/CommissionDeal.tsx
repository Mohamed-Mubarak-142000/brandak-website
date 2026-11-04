import { BadgeCheck, Ban, Calculator, CirclePause, Clock, Wallet } from 'lucide-react';

import { num, percent, price } from '@/lib/format';
import type { CommissionTerms } from '@/lib/types';

const EXAMPLE_ITEMS = 1000;
const EXAMPLE_SHIPPING = 60;

/** A worked example of one order as a calculator card, next to the rules in plain words. */
export function CommissionDeal({ terms }: { terms: CommissionTerms }) {
  const rate = percent(terms.commissionRate);
  const fee = Math.round(EXAMPLE_ITEMS * terms.commissionRate * 100) / 100;
  const paid = EXAMPLE_ITEMS + EXAMPLE_SHIPPING;
  const net = paid - fee;
  const feeShare = Math.max(1.5, (fee / paid) * 100);

  const rules = [
    { icon: BadgeCheck, title: 'فتح المتجر ببلاش', body: 'مفيش اشتراك شهري ولا رسوم فتح ولا رسوم على نشر المنتجات.' },
    { icon: Wallet, title: `${rate} بس لما تبيع`, body: 'العمولة على قيمة المنتجات في الطلب اللي اتسلّم للعميل، والشحن مش داخل فيها.' },
    { icon: Ban, title: 'الملغي والمرفوض ببلاش', body: 'الطلب اللي اتلغى أو العميل رفض يستلمه مفيش عليه أي عمولة.' },
    {
      icon: Clock,
      title: `السداد بـ InstaPay خلال ${num(terms.settlementDays)} يوم`,
      body: 'بتشوف المستحق وكشف حساب لكل طلب في «حسابي مع فاترينة»، وبترفع صورة الإيصال.',
    },
    {
      icon: CirclePause,
      title: 'لو المستحق اتأخر',
      body: `لو عدّى ${price(terms.maxUnpaidBalance)} أو عدّى ميعاد السداد، المتجر بيقف عن استقبال طلبات جديدة لحد ما تسدد.`,
    },
  ];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-10">
      <figure className="overflow-hidden rounded-window border border-line bg-surface shadow-card">
        <figcaption className="flex items-center gap-3 border-b border-line bg-accent-soft px-5 py-4 sm:px-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-card bg-surface text-accent shadow-card">
            <Calculator aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-extrabold">مثال: طلب واحد اتسلّم</span>
            <span className="block text-meta text-ink-2">بالعمولة الحالية {rate}</span>
          </span>
        </figcaption>

        <dl className="space-y-3 px-5 pt-5 text-ui tabular-nums sm:px-6 sm:text-body">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-2">قيمة المنتجات</dt>
            <dd className="font-bold">{price(EXAMPLE_ITEMS)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-2">
              الشحن <span className="text-meta text-success">(ليك كله)</span>
            </dt>
            <dd className="font-bold">{price(EXAMPLE_SHIPPING)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
            <dt className="text-ink-2">العميل بيدفع كاش</dt>
            <dd className="font-bold">{price(paid)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-2">عمولة فاترينة ({rate} من المنتجات بس)</dt>
            <dd className="font-bold text-accent">− {price(fee)}</dd>
          </div>
        </dl>

        <div className="m-5 rounded-panel bg-sunken p-4 sm:m-6">
          <div className="flex items-end justify-between gap-4">
            <span className="font-bold">اللي بيدخلك</span>
            <span className="text-page font-extrabold tabular-nums">{price(net)}</span>
          </div>
          <div aria-hidden className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-line">
            <span className="h-full flex-1 bg-success" />
            <span className="h-full bg-accent" style={{ width: `${feeShare}%` }} />
          </div>
          <div aria-hidden className="mt-2 flex justify-between text-meta text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" />
              ليك
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent" />
              العمولة
            </span>
          </div>
        </div>
        <p className="border-t border-line px-5 py-3 text-meta text-ink-2 sm:px-6">ولو العميل رفض الاستلام أو الطلب اتلغى، العمولة صفر.</p>
      </figure>

      <ul className="divide-y divide-line rounded-window border border-line bg-surface">
        {rules.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4 p-5 sm:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-card bg-accent-soft text-accent">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="font-extrabold sm:text-section">{title}</h3>
              <p className="mt-0.5 text-ui text-ink-2 sm:text-body">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
