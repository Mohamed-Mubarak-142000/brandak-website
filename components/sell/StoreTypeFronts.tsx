import { Check } from 'lucide-react';
import Link from 'next/link';

import { Awning } from '@/components/Awning';
import { num } from '@/lib/format';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

/**
 * The four kinds of store as shopfronts: each card is topped by the awning and lists how that kind
 * of store puts up its products in the app. `counts` (stores live now) is optional.
 */
export function StoreTypeFronts({ counts }: { counts?: Partial<Record<StoreType, number>> }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STORE_TYPES.map(({ type, label, plural, description, system, icon: Icon, path }) => {
        const count = counts?.[type] ?? 0;
        return (
          <li key={type} className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface">
            <Awning />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-5" />
                </span>
                <h3 className="text-section font-extrabold">{label}</h3>
              </div>
              <p className="mt-3 text-ink-2">{description}</p>
              <ul className="mt-4 space-y-2 border-t border-dashed border-line-strong pt-4 text-ui">
                {system.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {count > 0 ? (
                <Link href={path} className="mt-auto inline-flex min-h-11 items-center pt-4 text-ui font-bold text-accent underline-offset-4 hover:underline">
                  شوف {num(count)} من ال{plural} على فاترينة
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
