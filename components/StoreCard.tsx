import { Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { num } from '@/lib/format';
import type { PublicBrand } from '@/lib/types';

import { Rating } from './Rating';
import { StoreTypeBadge } from './StoreTypeBadge';

/** The round store logo, with a fallback icon. */
export function StoreLogo({ store, size = 64, className }: { store: Pick<PublicBrand, 'name' | 'logoUrl'>; size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface ${className ?? ''}`}
    >
      {store.logoUrl ? (
        <Image src={store.logoUrl} alt={`لوجو ${store.name}`} width={size} height={size} className="size-full object-cover" />
      ) : (
        <Store aria-hidden className="size-1/2 text-ink-3" />
      )}
    </span>
  );
}

/** A store tile: cover, logo overlapping it, name, type badge, rating and delivery reach. */
export function StoreCard({ store }: { store: PublicBrand }) {
  const zones = store.shipping?.zones?.length ?? 0;
  return (
    <Link
      href={`/brand/${store.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card"
    >
      <div className="relative aspect-[16/7] overflow-hidden bg-sunken">
        {store.coverUrl ? (
          <Image src={store.coverUrl} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-l from-accent-soft to-sunken" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div className="-mt-8 flex items-end justify-between gap-2">
          <StoreLogo store={store} size={64} className="border-4 border-surface shadow-card" />
          <StoreTypeBadge type={store.storeType} />
        </div>
        <h3 className="text-body font-extrabold transition-colors group-hover:text-accent">{store.name}</h3>
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
