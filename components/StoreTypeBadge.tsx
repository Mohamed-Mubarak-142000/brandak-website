import clsx from 'clsx';

import { storeTypeInfo } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

export function StoreTypeBadge({ type, className }: { type?: StoreType | null; className?: string }) {
  const info = storeTypeInfo(type);
  const Icon = info.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-meta font-semibold text-accent', className)}>
      <Icon aria-hidden className="size-3.5" />
      {info.label}
    </span>
  );
}
