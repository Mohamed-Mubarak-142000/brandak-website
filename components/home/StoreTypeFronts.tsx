import Link from 'next/link';

import { Awning } from '@/components/Awning';
import { SectionHeader } from '@/components/SectionHeader';
import { countOf } from '@/components/stores/words';
import { STORE_TYPES } from '@/lib/store-types';
import type { StoreType } from '@/lib/types';

/** One shopfront per kind of store, with how many are open. A kind with none yet invites sellers. */
export function StoreTypeFronts({ counts }: { counts: Record<StoreType, number> }) {
  return (
    <section>
      <SectionHeader title="تسوّق حسب نوع المتجر" body="كل نوع بيعرض منتجاته بالطريقة اللي تناسبه." href="/stores" linkLabel="كل المتاجر" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STORE_TYPES.map(({ type, label, plural, description, icon: Icon, path }) => {
          const n = counts[type] ?? 0;
          return (
            <li key={type} className="flex">
              <Link href={path} className="group flex w-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-colors hover:border-brand">
                <Awning tone={n ? 'brand' : 'soft'} />
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <Icon aria-hidden className="size-7 text-accent" />
                  <h3 className="mt-3 text-section font-extrabold group-hover:text-accent">{plural}</h3>
                  <p className="mt-1 text-ui text-ink-2">{description}</p>
                  <p className="mt-auto pt-4 text-ui font-bold">
                    {n ? (
                      <span className="text-ink">{countOf(n, label, plural)} على فاترينة</span>
                    ) : (
                      <span className="text-ink-3">قريب، وممكن تكون أول {label}</span>
                    )}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
