import { Check, X } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { OrderDetail, OrderStatus } from '@/lib/types';

import { ORDER_STATUS_AR } from './orderStatus';

const FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const HINT: Partial<Record<OrderStatus, string>> = {
  AWAITING_CONFIRMATION: 'أكّد الطلب بالكود اللي على إيميلك',
  PENDING: 'المتجر هيراجع طلبك ويأكده',
  CONFIRMED: 'المتجر أكد الطلب',
  PROCESSING: 'بيتجهز ويتغلّف',
  SHIPPED: 'مع شركة الشحن في الطريق ليك',
  DELIVERED: 'وصل بالسلامة',
};

const dateTime = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/**
 * Vertical progress: done steps filled, the current one ringed, future ones muted. Cancelled and
 * refused orders end early with the steps they reached, then how they ended (in red).
 */
export function OrderTimeline({ order }: { order: OrderDetail }) {
  const pickup = order.fulfillment === 'PICKUP';
  const label = (s: OrderStatus) => (pickup && s === 'SHIPPED' ? 'جاهز للاستلام' : pickup && s === 'DELIVERED' ? 'اتسلم' : ORDER_STATUS_AR[s]);
  const hint = (s: OrderStatus) => (pickup && s === 'SHIPPED' ? 'تعالى استلمه من المتجر' : pickup && s === 'DELIVERED' ? 'استلمته من المتجر' : HINT[s]);
  const at = (s: OrderStatus) => order.history.filter((h) => h.status === s).at(-1);

  const awaiting = order.status === 'AWAITING_CONFIRMATION' || !!at('AWAITING_CONFIRMATION');
  const flow: OrderStatus[] = awaiting ? ['AWAITING_CONFIRMATION', ...FLOW] : FLOW;
  const ended = order.status === 'CANCELLED' || order.status === 'REFUSED';
  const reached = ended ? flow.filter((s) => at(s)) : flow.slice(0, flow.indexOf(order.status) + 1);
  const steps: OrderStatus[] = ended ? [...reached, order.status] : flow;

  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => {
        const isEnd = s === 'CANCELLED' || s === 'REFUSED';
        const done = reached.includes(s) || isEnd;
        const current = s === order.status;
        const last = i === steps.length - 1;
        const nextDone = !last && (reached.includes(steps[i + 1]) || steps[i + 1] === order.status);
        const entry = at(s);
        return (
          <li key={s} className="flex gap-3" aria-current={current ? 'step' : undefined}>
            <div className="flex w-7 flex-col items-center">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border-2',
                  isEnd ? 'border-danger bg-danger text-white' : done ? 'border-success bg-success text-white' : 'border-line-strong bg-surface',
                  current && !isEnd && 'ring-4 ring-success/20',
                )}
              >
                {isEnd ? <X aria-hidden className="size-4" strokeWidth={3} /> : done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : null}
              </span>
              {!last ? <span aria-hidden className={cn('my-1 min-h-7 w-0.5 flex-1 rounded-full', nextDone ? (steps[i + 1] === 'CANCELLED' || steps[i + 1] === 'REFUSED' ? 'bg-danger' : 'bg-success') : 'bg-line')} /> : null}
            </div>
            <div className={cn('min-w-0 flex-1 pt-0.5', !last && 'pb-5')}>
              <p className={cn('text-ui', current ? 'font-extrabold' : 'font-semibold', isEnd ? 'text-danger' : done ? 'text-ink' : 'text-ink-3')}>
                {label(s)}
                {current && !isEnd ? <span className="sr-only"> (الحالة الحالية)</span> : null}
              </p>
              {entry ? (
                <p className="text-meta text-ink-3">
                  {dateTime.format(new Date(entry.at))}
                  {entry.note ? ` · ${entry.note}` : ''}
                </p>
              ) : !done && hint(s) ? (
                <p className="text-meta text-ink-3">{hint(s)}</p>
              ) : null}
              {isEnd && order.cancelReason ? <p className="mt-0.5 text-meta font-semibold text-danger">السبب: {order.cancelReason}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
