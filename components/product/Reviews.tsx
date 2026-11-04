import { BadgeCheck, MessageSquareText, Star, Store } from 'lucide-react';

import { OpenInApp } from '@/components/OpenInApp';
import { date, num } from '@/lib/format';
import { appPath } from '@/lib/links';
import type { Review } from '@/lib/types';

type Stars = Record<'1' | '2' | '3' | '4' | '5', number> | null;

function StarRow({ value, className = 'size-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex" aria-label={`${num(value)} من ٥ نجوم`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={`${className} ${i <= Math.round(value) ? 'fill-brand text-brand' : 'fill-line text-line-strong'}`} />
      ))}
    </span>
  );
}

/** First reviews, the star histogram, and a link to the rest in the app. */
export function Reviews({ productId, items, total, stars, avg }: { productId: string; items: Review[]; total: number; stars: Stars; avg: number }) {
  if (total === 0 || !items.length) {
    return (
      <div className="flex flex-col items-center rounded-panel border border-line bg-sunken px-6 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-surface text-ink-3 shadow-card">
          <MessageSquareText aria-hidden className="size-6" />
        </span>
        <p className="mt-4 text-body font-extrabold">لسه مفيش تقييمات للمنتج ده</p>
        <p className="mt-1 max-w-sm text-ui text-ink-2">التقييم بيكون من اللي استلم الطلب فعلًا، من التطبيق. اطلبه وكن أول واحد يقيّمه.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10">
        <div className="self-start rounded-panel border border-line p-5">
          <p className="flex items-baseline gap-2">
            <span className="text-display font-extrabold leading-none">{num(Math.round(avg * 10) / 10)}</span>
            <span className="text-ui text-ink-3">من ٥</span>
          </p>
          <div className="mt-2">
            <StarRow value={avg} />
          </div>
          <p className="mt-1 text-meta text-ink-3">من {num(total)} تقييم</p>
          {stars ? (
            <ul className="mt-5 space-y-2" aria-label="توزيع النجوم">
              {(['5', '4', '3', '2', '1'] as const).map((k) => {
                const n = stars[k] ?? 0;
                const pct = total ? Math.round((n / total) * 100) : 0;
                return (
                  <li key={k} className="flex items-center gap-2 text-meta text-ink-2">
                    <span className="sr-only">
                      {num(n)} تقييم بـ {num(Number(k))} نجوم
                    </span>
                    <span aria-hidden className="inline-flex w-7 items-center gap-0.5">
                      {num(Number(k))}
                      <Star className="size-3 fill-brand text-brand" />
                    </span>
                    <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </span>
                    <span aria-hidden className="w-8 text-end tabular-nums">
                      {num(n)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <ul className="divide-y divide-line">
          {items.slice(0, 3).map((r) => (
            <li key={r.id} className="py-5 first:pt-0">
              <div className="flex items-center gap-3">
                <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-ui font-extrabold text-ink-2">
                  {r.userName.trim().charAt(0) || '؟'}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-bold">{r.userName}</span>
                    {r.verifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 text-meta font-semibold text-success">
                        <BadgeCheck aria-hidden className="size-3.5" />
                        استلم الطلب
                      </span>
                    ) : null}
                  </p>
                  <p className="flex items-center gap-2">
                    <StarRow value={r.rating} className="size-3.5" />
                    <time dateTime={r.createdAt} className="text-meta text-ink-3">
                      {date(r.createdAt)}
                    </time>
                  </p>
                </div>
              </div>
              {r.comment ? <p className="mt-3 whitespace-pre-line text-ui text-ink sm:text-body">{r.comment}</p> : null}
              {r.reply?.text ? (
                <div className="mt-3 rounded-card border-s-4 border-brand bg-sunken px-4 py-3">
                  <p className="flex items-center gap-1 text-meta font-bold text-ink-2">
                    <Store aria-hidden className="size-3.5" />
                    رد المتجر
                  </p>
                  <p className="mt-1 whitespace-pre-line text-ui text-ink-2">{r.reply.text}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <OpenInApp path={appPath.product(productId)} variant="secondary" className="mt-6">
        شوف كل التقييمات ({num(total)}) في التطبيق
      </OpenInApp>
    </div>
  );
}
