import { CircleAlert, Clock, Pencil } from 'lucide-react';
import Link from 'next/link';

import type { OwnerBrand } from '@/lib/seller-types';

import { ResubmitButton } from './ResubmitButton';

const action = 'inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-5 text-ui font-bold text-ink hover:border-brand hover:text-accent';

/** Under review / rejected / suspended notice for the top of the dashboard. Null when active. */
export function StatusBanner({ brand }: { brand: OwnerBrand }) {
  if (brand.status === 'ACTIVE') return null;

  if (brand.status === 'PENDING_REVIEW') {
    return (
      <div role="status" className="flex flex-wrap items-start gap-3 rounded-panel border border-warning/20 bg-warning-soft p-4">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-warning">طلبك تحت المراجعة</p>
          <p className="mt-0.5 text-ui text-ink-2">
            فريق فاترينة بيراجع «{brand.name}» دلوقتي. عادةً بنرد خلال يوم عمل، وهيوصلك إشعار أول ما نخلص. أثناء المراجعة تقدر تجهّز إعدادات الشحن وتضيف منتجاتك.
          </p>
        </div>
        <Link href="/seller/settings" className={action}>
          <Pencil aria-hidden className="size-4" />
          إعدادات المتجر
        </Link>
      </div>
    );
  }

  const rejected = brand.status === 'REJECTED';
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-panel border border-danger/20 bg-danger-soft p-4">
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-danger">{rejected ? 'محتاجين شوية تعديلات' : 'المتجر موقوف مؤقتاً'}</p>
          <p className="mt-0.5 text-ui text-ink-2">
            {rejected
              ? 'عدّل بيانات المتجر حسب ملاحظة فريق المراجعة، وابعت الطلب تاني.'
              : 'المتجر مش ظاهر للعملاء حالياً. تواصل مع فريق فاترينة لمعرفة التفاصيل.'}
          </p>
          {brand.statusReason ? (
            <p className="mt-2 rounded-card bg-surface p-3 text-ui">
              <span className="font-bold">ملاحظة فريق المراجعة: </span>
              {brand.statusReason}
            </p>
          ) : null}
        </div>
      </div>
      {rejected ? (
        <div className="flex flex-wrap items-start gap-2">
          <ResubmitButton />
          <Link href="/seller/settings" className={action}>
            <Pencil aria-hidden className="size-4" />
            تعديل بيانات المتجر
          </Link>
        </div>
      ) : (
        <Link href="/contact" className={`${action} self-start`}>
          كلّم فريق فاترينة
        </Link>
      )}
    </div>
  );
}
