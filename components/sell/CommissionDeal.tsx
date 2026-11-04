import { BadgeCheck, Ban, Clock, CirclePause, Wallet } from 'lucide-react';

import { num, percent, price } from '@/lib/format';
import type { CommissionTerms } from '@/lib/types';

const EXAMPLE_ITEMS = 1000;
const EXAMPLE_SHIPPING = 60;

/** The terms in plain words, with live numbers, next to a worked example of one order. */
export function CommissionDeal({ terms }: { terms: CommissionTerms }) {
  const rate = percent(terms.commissionRate);
  const fee = Math.round(EXAMPLE_ITEMS * terms.commissionRate * 100) / 100;

  const points = [
    { icon: BadgeCheck, title: 'فتح المتجر ببلاش', body: 'مفيش اشتراك شهري ولا رسوم فتح ولا رسوم على نشر المنتجات.' },
    { icon: Wallet, title: `${rate} بس لما تبيع`, body: `العمولة على قيمة المنتجات في الطلب اللي اتسلّم للعميل، والشحن مش داخل فيها.` },
    { icon: Ban, title: 'الملغي والمرفوض ببلاش', body: 'الطلب اللي اتلغى أو العميل رفض يستلمه مفيش عليه أي عمولة.' },
    { icon: Clock, title: `السداد بـ InstaPay خلال ${num(terms.settlementDays)} يوم`, body: 'بتشوف المستحق وكشف حساب لكل طلب في «حسابي مع فاترينة»، وبترفع صورة الإيصال.' },
    {
      icon: CirclePause,
      title: 'لو المستحق اتأخر',
      body: `لو عدّى ${price(terms.maxUnpaidBalance)} أو عدّى ميعاد السداد، المتجر بيقف عن استقبال طلبات جديدة لحد ما تسدد.`,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
      <ul className="space-y-6">
        {points.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <Icon aria-hidden className="mt-1 size-6 shrink-0 text-brand" />
            <div>
              <h3 className="text-body font-extrabold sm:text-section">{title}</h3>
              <p className="mt-0.5 text-ink-2">{body}</p>
            </div>
          </li>
        ))}
      </ul>

      <figure className="self-start rounded-panel border border-line-strong bg-surface p-5 sm:p-6">
        <figcaption className="text-body font-extrabold">مثال: طلب منتجاته بـ {price(EXAMPLE_ITEMS)}</figcaption>
        <dl className="mt-4 space-y-3 text-ui tabular-nums sm:text-body">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">قيمة المنتجات</dt>
            <dd className="font-bold">{price(EXAMPLE_ITEMS)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-2">الشحن (ليك كله)</dt>
            <dd className="font-bold">{price(EXAMPLE_SHIPPING)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-dashed border-line-strong pt-3">
            <dt className="text-ink-2">عمولة فاترينة ({rate} من المنتجات)</dt>
            <dd className="font-bold text-accent">{price(fee)}</dd>
          </div>
          <div className="flex justify-between gap-4 rounded-card bg-sunken px-3 py-2.5">
            <dt className="font-bold">اللي بيدخلك</dt>
            <dd className="font-extrabold">{price(EXAMPLE_ITEMS + EXAMPLE_SHIPPING - fee)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-meta text-ink-3">ولو العميل رفض الاستلام، العمولة صفر.</p>
      </figure>
    </div>
  );
}
