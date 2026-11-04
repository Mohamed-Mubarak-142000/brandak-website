import { BadgeCheck, Star, Store } from 'lucide-react';

import { OpenInApp } from '@/components/OpenInApp';
import { date, num } from '@/lib/format';
import { appPath } from '@/lib/links';
import type { Review } from '@/lib/types';

type Stars = Record<'1' | '2' | '3' | '4' | '5', number> | null;

function StarRow({ value, className = 'size-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex" aria-label={`${num(value)} من ٥ نجوم`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={`${className} ${i <= Math.round(value) ? 'fill-brand text-brand' : 'text-line-strong'}`} />
      ))}
    </span>
  );
}

/** First reviews, the star histogram, and a link to the rest in the app. */
export function Reviews({ productId, items, total, stars, avg }: { productId: string; items: Review[]; total: number; stars: Stars; avg: number }) {
  return (
    <section aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-section font-extrabold">
        التقييمات {total > 0 ? <span className="text-body font-semibold text-ink-3">({num(total)})</span> : null}
      </h2>

      {total === 0 || !items.length ? (
        <p className="mt-2 text-ui text-ink-2">لسه مفيش تقييمات. التقييم بيكون من اللي استلم الطلب فعلًا.</p>
      ) : (
        <div className="mt-4 grid gap-8 md:grid-cols-[16rem_1fr]">
          <div>
            <p className="flex items-baseline gap-2">
              <span className="text-display font-extrabold leading-none">{num(Math.round(avg * 10) / 10)}</span>
              <span className="text-ui text-ink-3">من ٥</span>
            </p>
            <StarRow value={avg} />
            {stars ? (
              <ul className="mt-4 space-y-1.5" aria-label="توزيع النجوم">
                {(['5', '4', '3', '2', '1'] as const).map((k) => {
                  const n = stars[k] ?? 0;
                  const pct = total ? Math.round((n / total) * 100) : 0;
                  return (
                    <li key={k} className="flex items-center gap-2 text-meta text-ink-2">
                      <span className="sr-only">
                        {num(n)} تقييم بـ {num(Number(k))} نجوم
                      </span>
                      <span aria-hidden className="w-3 text-center">
                        {num(Number(k))}
                      </span>
                      <Star aria-hidden className="size-3 fill-brand text-brand" />
                      <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </span>
                      <span aria-hidden className="w-8 text-end">
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
              <li key={r.id} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-bold">{r.userName}</span>
                  <StarRow value={r.rating} className="size-3.5" />
                  <time dateTime={r.createdAt} className="text-meta text-ink-3">
                    {date(r.createdAt)}
                  </time>
                </div>
                {r.verifiedPurchase ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-meta text-success">
                    <BadgeCheck aria-hidden className="size-3.5" />
                    استلم الطلب
                  </p>
                ) : null}
                {r.comment ? <p className="mt-2 whitespace-pre-line text-ui">{r.comment}</p> : null}
                {r.reply?.text ? (
                  <div className="mt-3 rounded-card border-s-4 border-brand bg-sunken px-3 py-2">
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
      )}

      {total > 0 ? (
        <OpenInApp path={appPath.product(productId)} variant="quiet" className="mt-4">
          شوف كل التقييمات ({num(total)}) في التطبيق
        </OpenInApp>
      ) : null}
    </section>
  );
}
