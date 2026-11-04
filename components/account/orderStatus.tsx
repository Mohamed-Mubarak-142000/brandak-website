import { cn } from '@/lib/cn';
import type { OrderStatus } from '@/lib/types';

/** Same wording and tones as the app (`brandak app/src/ui/bits.tsx`). */
export const ORDER_STATUS_AR: Record<OrderStatus, string> = {
  AWAITING_CONFIRMATION: 'مستني تأكيدك بالكود',
  PENDING: 'في انتظار التأكيد',
  CONFIRMED: 'تم التأكيد',
  PROCESSING: 'جاري التجهيز',
  SHIPPED: 'في الطريق',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
  REFUSED: 'رفض الاستلام',
};

const TONE: Record<OrderStatus, string> = {
  AWAITING_CONFIRMATION: 'bg-warning-soft text-warning',
  PENDING: 'bg-warning-soft text-warning',
  CONFIRMED: 'bg-accent-soft text-accent',
  PROCESSING: 'bg-accent-soft text-accent',
  SHIPPED: 'bg-accent-soft text-accent',
  DELIVERED: 'bg-success-soft text-success',
  CANCELLED: 'bg-danger-soft text-danger',
  REFUSED: 'bg-danger-soft text-danger',
};

/** Statuses that are still moving (the "الحالية" filter). */
export const ACTIVE_STATUSES: OrderStatus[] = ['AWAITING_CONFIRMATION', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'];

/** The customer can cancel until the store confirms. */
export const canCancel = (s: OrderStatus) => s === 'AWAITING_CONFIRMATION' || s === 'PENDING';

export function StatusChip({ status, label, className }: { status: OrderStatus; label?: string; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-meta font-bold', TONE[status], className)}>{label || ORDER_STATUS_AR[status]}</span>
  );
}
