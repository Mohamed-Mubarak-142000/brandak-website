import { CalendarClock } from 'lucide-react';
import Link from 'next/link';

import { date, num } from '@/lib/format';
import type { Campaign } from '@/lib/types';

/** Campaign colours come from the dashboard; accept only a plain hex/rgb/hsl value. */
export function safeColor(c?: string | null) {
  return c && /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%]+\))$/i.test(c.trim()) ? c.trim() : 'var(--brand)';
}

/** A running campaign: its colour as a band on the start edge, the text stays in ink for contrast. */
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const color = safeColor(campaign.color);
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group flex h-full overflow-hidden rounded-panel border border-line bg-surface hover:border-line-strong"
    >
      <span aria-hidden className="w-2 shrink-0" style={{ background: color }} />
      <span className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-body font-extrabold group-hover:text-accent group-hover:underline">{campaign.nameAr}</span>
          {campaign.minPercent > 0 ? (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-meta font-bold text-danger">خصم {num(campaign.minPercent)}٪ وأكتر</span>
          ) : null}
        </span>
        {campaign.descriptionAr ? <span className="line-clamp-2 text-ui text-ink-2">{campaign.descriptionAr}</span> : null}
        <span className="mt-auto inline-flex items-center gap-1 text-meta text-ink-3">
          <CalendarClock aria-hidden className="size-3.5" />
          لحد {date(campaign.endsAt)}
        </span>
      </span>
    </Link>
  );
}
