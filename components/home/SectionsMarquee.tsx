import Link from 'next/link';

import { SectionHeader } from '@/components/SectionHeader';
import { Marquee } from '@/components/ui/Marquee';
import { categoryIcon } from '@/lib/category-icons';
import type { Category } from '@/lib/types';

/** Top-level sections as round icon tiles in an endless row. */
export function SectionsMarquee({ sections }: { sections: Category[] }) {
  if (!sections.length) return null;
  return (
    <section>
      <SectionHeader title="الأقسام" body="من الهدوم للأجهزة لطلبات البيت." href="/search" linkLabel="كل المنتجات" />
      <Marquee
        label="الأقسام"
        items={sections}
        getKey={(c) => c._id}
        secondsPerItem={3}
        itemClassName="pe-3 sm:pe-5"
        render={(c) => {
          const Icon = categoryIcon(c.icon);
          return (
            <Link href={`/category/${c._id}`} className="group flex w-24 flex-col items-center gap-2.5 py-1 text-center sm:w-28">
              <span className="grid size-20 place-items-center rounded-full border border-line bg-sunken text-accent transition-colors group-hover:border-brand group-hover:bg-accent-soft sm:size-24">
                <Icon aria-hidden className="size-8 sm:size-9" />
              </span>
              <span className="line-clamp-2 text-ui font-semibold leading-snug text-ink group-hover:text-accent">{c.nameAr}</span>
            </Link>
          );
        }}
      />
    </section>
  );
}
