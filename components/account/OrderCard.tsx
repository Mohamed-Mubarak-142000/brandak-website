import { ChevronLeft, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { StoreLogo } from '@/components/StoreCard';
import { date, num, price } from '@/lib/format';
import type { OrderSummary } from '@/lib/types';

import { StatusChip } from './orderStatus';

/** One order in a list: photo, store, number and date, pieces and total, status. */
export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={`/account/orders/${order.id}`}
      aria-label={`طلب رقم ${order.orderNumber} من ${order.brand.name}، ${order.statusLabelAr || ''}`}
      className="group flex gap-3 rounded-panel border border-line bg-surface p-3 transition-shadow hover:shadow-card sm:gap-4 sm:p-4"
    >
      <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken sm:size-24">
        {order.previewImageUrl ? (
          <Image src={order.previewImageUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <Package aria-hidden className="size-8 text-ink-3" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="flex items-center gap-2">
          <StoreLogo store={{ name: order.brand.name, logoUrl: null }} size={24} />
          <span className="min-w-0 flex-1 truncate font-bold">{order.brand.name}</span>
          <StatusChip status={order.status} className="hidden sm:inline-flex" />
        </span>
        <span className="text-meta text-ink-3">
          <bdi>#{order.orderNumber}</bdi> · {date(order.createdAt)}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="text-ui text-ink-2">
            {num(order.itemsCount)} قطعة · <span className="font-bold text-ink">{price(order.grandTotal)}</span>
          </span>
          <StatusChip status={order.status} className="sm:hidden" />
          <ChevronLeft aria-hidden className="hidden size-5 text-ink-3 transition-transform group-hover:-translate-x-0.5 sm:block" />
        </span>
      </span>
    </Link>
  );
}

export function OrderCardSkeleton() {
  return (
    <div aria-hidden className="flex gap-4 rounded-panel border border-line bg-surface p-4">
      <span className="size-20 animate-pulse rounded-card bg-skeleton sm:size-24" />
      <span className="flex flex-1 flex-col justify-center gap-2">
        <span className="h-4 w-1/2 animate-pulse rounded bg-skeleton" />
        <span className="h-3 w-1/3 animate-pulse rounded bg-skeleton" />
        <span className="h-3 w-2/5 animate-pulse rounded bg-skeleton" />
      </span>
    </div>
  );
}
