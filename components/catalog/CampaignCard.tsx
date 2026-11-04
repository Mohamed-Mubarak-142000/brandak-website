import { CalendarClock, ChevronLeft, Percent } from 'lucide-react';
import Link from 'next/link';

import { date, num } from '@/lib/format';
import type { Campaign } from '@/lib/types';

/** Campaign colours come from the dashboard; accept only a plain hex/rgb/hsl value. */
export function safeColor(c?: string | null) {
  return c && /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%]+\))$/i.test(c.trim()) ? c.trim() : 'var(--brand)';
}

/** A light wash of the campaign colour for backgrounds; text on it stays in ink. */
export const tint = (color: string, amount = 12) => `color-mix(in srgb, ${color} ${amount}%, white)`;

const daysWord = (n: number) => (n === 1 ? 'يوم' : n === 2 ? 'يومين' : n <= 10 ? `${num(n)} أيام` : `${num(n)} يوم`);

/** "فاضل ٣ أيام" / "آخر يوم" / "بيبدأ بعد يومين" / "خلص", from the campaign dates. */
export function timeLeft(c: Pick<Campaign, 'startsAt' | 'endsAt'>, now = Date.now()) {
  const start = new Date(c.startsAt).getTime();
  const end = new Date(c.endsAt).getTime();
  const day = 86_400_000;
  if (end < now) return { state: 'ended' as const, text: `خلص في ${date(c.endsAt)}` };
  if (start > now) return { state: 'soon' as const, text: `بيبدأ بعد ${daysWord(Math.max(1, Math.ceil((start - now) / day)))}` };
  const left = Math.ceil((end - now) / day);
  return { state: 'running' as const, text: left <= 1 ? 'آخر يوم في العرض' : `فاضل ${daysWord(left)}` };
}

/** A running campaign: a band tinted with its colour, name, discount, and the days left. */
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const color = safeColor(campaign.color);
  const left = timeLeft(campaign);
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card"
    >
      <span className="flex items-center justify-between gap-3 px-5 py-4" style={{ background: tint(color, 14) }}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface shadow-card" style={{ color }}>
          <Percent aria-hidden className="size-5" />
        </span>
        {campaign.minPercent > 0 ? (
          <span className="rounded-full bg-surface px-3 py-1 text-ui font-extrabold text-danger">خصم {num(campaign.minPercent)}٪ وأكتر</span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-body font-extrabold transition-colors group-hover:text-accent">{campaign.nameAr}</span>
        {campaign.descriptionAr ? <span className="line-clamp-2 text-ui text-ink-2">{campaign.descriptionAr}</span> : null}
        <span className="mt-auto flex items-center justify-between gap-2 pt-2 text-meta text-ink-3">
          <span className="inline-flex items-center gap-1">
            <CalendarClock aria-hidden className="size-3.5" />
            {left.text}، لحد {date(campaign.endsAt)}
          </span>
          <ChevronLeft aria-hidden className="size-4 text-ink-3 transition-colors group-hover:text-accent" />
        </span>
      </span>
    </Link>
  );
}
