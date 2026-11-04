import { ChevronLeft } from 'lucide-react';
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
      <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {STORE_TYPES.map(({ type, label, plural, description, icon: Icon, path }) => {
          const n = counts[type] ?? 0;
          return (
            <li key={type} className="flex">
              <Link
                href={path}
                className="group flex w-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card"
              >
                <Awning tone="soft" className="h-3.5" />
                <div className="flex flex-1 flex-col p-5">
                  <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <h3 className="mt-4 text-section font-extrabold">{plural}</h3>
                  <p className="mt-1 text-ui text-ink-2">{description}</p>
                  <p className="mt-auto flex items-center justify-between gap-2 pt-5 text-ui font-bold">
                    {n ? (
                      <span className="text-ink">{countOf(n, label, plural)} على فاترينة</span>
                    ) : (
                      <span className="text-ink-3">قريبًا — كن أول {label}</span>
                    )}
                    <ChevronLeft aria-hidden className="size-5 shrink-0 text-ink-3 transition-colors group-hover:text-accent" />
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
