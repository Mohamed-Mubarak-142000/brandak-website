import { Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { num } from '@/lib/format';
import type { PublicBrand } from '@/lib/types';

import { Rating } from './Rating';
import { StoreTypeBadge } from './StoreTypeBadge';

/** A store tile: cover, logo, type badge, rating and how widely it delivers. */
export function StoreCard({ store }: { store: PublicBrand }) {
  const zones = store.shipping?.zones?.length ?? 0;
  return (
    <Link href={`/brand/${store.slug}`} className="group flex w-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-colors duration-150 hover:border-brand">
      <div className="relative aspect-[16/7] bg-sunken">
        {store.coverUrl ? <Image src={store.coverUrl} alt="" fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover" /> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
        <div className="-mt-8 size-16 overflow-hidden rounded-full border-4 border-surface bg-sunken">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={`لوجو ${store.name}`} width={64} height={64} className="size-full object-cover" />
          ) : (
            <Store aria-hidden className="m-auto mt-4 size-6 text-ink-3" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-body font-bold group-hover:text-accent">{store.name}</h3>
          <StoreTypeBadge type={store.storeType} />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-ink-2">
          <Rating avg={store.ratingAvg} count={store.ratingCount} />
          {zones ? (
            <span className="inline-flex items-center gap-1">
              <Truck aria-hidden className="size-3.5" />
              بيوصّل لـ {num(zones)} محافظة
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function StoreGrid({ stores }: { stores: PublicBrand[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stores.map((s) => (
        <li key={s.id} className="flex">
          <StoreCard store={s} />
        </li>
      ))}
    </ul>
  );
}
