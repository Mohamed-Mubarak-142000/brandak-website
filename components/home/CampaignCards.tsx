import { CampaignCard } from '@/components/catalog/CampaignCard';
import { SectionHeader } from '@/components/SectionHeader';
import type { Campaign } from '@/lib/types';

/** Running sale campaigns. Renders nothing when there are none. */
export function CampaignCards({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;
  return (
    <section>
      <SectionHeader title="عروض شغّالة دلوقتي" href="/offers" linkLabel="كل العروض" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <li key={c._id} className="flex">
            <CampaignCard campaign={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
