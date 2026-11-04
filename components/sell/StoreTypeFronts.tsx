import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { Awning } from '@/components/Awning';
import { num } from '@/lib/format';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

/**
 * The four kinds of store as shopfronts: each card wears a thin awning and lists how that kind of
 * store puts up its products in the app. `counts` (stores live now) is optional.
 */
export function StoreTypeFronts({ counts }: { counts?: Partial<Record<StoreType, number>> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STORE_TYPES.map(({ type, label, plural, description, system, icon: Icon, path }) => {
        const count = counts?.[type] ?? 0;
        return (
          <li key={type} className="flex flex-col overflow-hidden rounded-panel border border-line bg-surface transition-shadow hover:shadow-card">
            <Awning className="h-3" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-card bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-6" />
                </span>
                {count > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-meta font-semibold text-success">
                    <span aria-hidden className="size-1.5 rounded-full bg-success" />
                    {num(count)} متجر شغال
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-section font-extrabold">{label}</h3>
              <p className="mt-1 text-ui text-ink-2">{description}</p>
              <ul className="mt-4 space-y-2.5 border-t border-line pt-4 text-ui">
                {system.map((s) => (
                  <li key={s} className="flex gap-2">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              {count > 0 ? (
                <Link
                  href={path}
                  className="mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-ui font-bold text-accent underline-offset-4 hover:underline"
                >
                  اتفرّج على ال{plural}
                  <ChevronLeft aria-hidden className="size-4" />
                </Link>
              ) : (
                <p className="mt-auto pt-4 text-ui font-semibold text-ink-3">ابدأ من أوائل ال{plural} على فاترينة</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
