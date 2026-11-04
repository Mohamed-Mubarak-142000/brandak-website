import Link from 'next/link';

import { SectionHeader } from '@/components/SectionHeader';
import { StoreLogo } from '@/components/StoreCard';
import { Marquee } from '@/components/ui/Marquee';
import type { PublicBrand } from '@/lib/types';

/** Every store's logo in an endless row, each one a door to its page. */
export function StoreLogos({ stores }: { stores: PublicBrand[] }) {
  if (!stores.length) return null;
  return (
    <section>
      <SectionHeader title="متاجر على فاترينة" body="كل متجر بنراجعه قبل ما يظهر." href="/stores" linkLabel="كل المتاجر" />
      <Marquee
        label="متاجر على فاترينة"
        items={stores}
        getKey={(s) => s.id}
        secondsPerItem={3.5}
        itemClassName="pe-4 sm:pe-6"
        render={(s) => (
          <Link href={`/brand/${s.slug}`} className="group flex w-28 flex-col items-center gap-2.5 py-1 text-center sm:w-32">
            <StoreLogo store={s} size={88} className="transition-[border-color,box-shadow] group-hover:border-brand group-hover:shadow-card" />
            <span className="line-clamp-1 w-full text-ui font-bold text-ink group-hover:text-accent">{s.name}</span>
          </Link>
        )}
      />
    </section>
  );
}
