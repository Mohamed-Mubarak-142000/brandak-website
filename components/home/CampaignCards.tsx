import Link from 'next/link';

import { SectionHeader } from '@/components/SectionHeader';
import { date, num } from '@/lib/format';
import type { Campaign } from '@/lib/types';

/** Running sale campaigns, each in its own colour. Renders nothing when there are none. */
export function CampaignCards({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;
  return (
    <section>
      <SectionHeader title="عروض شغّالة دلوقتي" href="/offers" linkLabel="كل العروض" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <li key={c._id} className="flex">
            <Link
              href={`/campaigns/${c.slug}`}
              style={{ borderInlineStartColor: c.color }}
              className="group flex w-full flex-col rounded-panel border border-s-[6px] border-line bg-surface p-5 transition-colors hover:bg-sunken"
            >
              <h3 className="text-section font-extrabold group-hover:text-accent">{c.nameAr}</h3>
              {c.descriptionAr ? <p className="mt-1 line-clamp-2 text-ui text-ink-2">{c.descriptionAr}</p> : null}
              <p className="mt-auto flex flex-wrap gap-x-4 pt-4 text-meta text-ink-2">
                {c.minPercent ? <span className="font-bold text-ink">خصومات من {num(c.minPercent)}٪</span> : null}
                <span>لحد {date(c.endsAt)}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
