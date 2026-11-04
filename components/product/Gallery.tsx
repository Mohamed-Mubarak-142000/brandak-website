'use client';

import clsx from 'clsx';
import { Package } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

/**
 * Main photo + thumbnails. When photos are tagged by colour (imageColors), colour buttons filter the
 * photos to the chosen colour; untagged photos (null) belong to every colour.
 */
export function Gallery({ images, imageColors, title, colorLabel }: { images: string[]; imageColors?: (string | null)[]; title: string; colorLabel?: string }) {
  const colors = useMemo(() => {
    const seen: string[] = [];
    for (const c of imageColors ?? []) if (c && !seen.includes(c)) seen.push(c);
    return seen;
  }, [imageColors]);

  const [color, setColor] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const shown = useMemo(() => {
    const all = images.map((src, i) => ({ src, color: imageColors?.[i] ?? null }));
    if (!color) return all;
    const match = all.filter((p) => p.color === null || p.color === color);
    return match.length ? match : all;
  }, [images, imageColors, color]);

  const current = shown[Math.min(active, shown.length - 1)];

  const pickColor = (c: string | null) => {
    setColor(c);
    setActive(0);
  };

  return (
    <div className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-panel border border-line bg-sunken">
        {current ? (
          <Image
            key={current.src}
            src={current.src}
            alt={color ? `${title}، لون ${color}` : title}
            fill
            priority
            sizes="(min-width: 1024px) 540px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Package aria-hidden className="absolute inset-0 m-auto size-14 text-ink-3" />
        )}
      </div>

      {shown.length > 1 ? (
        <ul className="rail mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="صور المنتج">
          {shown.map((p, i) => {
            const on = p === current;
            return (
              <li key={p.src} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`صورة ${i + 1} من ${shown.length}`}
                  aria-pressed={on}
                  className={clsx(
                    'relative block size-16 overflow-hidden rounded-card border-2 bg-sunken sm:size-20',
                    on ? 'border-brand' : 'border-transparent opacity-80 hover:opacity-100',
                  )}
                >
                  <Image src={p.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {colors.length > 1 ? (
        <div className="mt-4">
          <p className="text-meta font-semibold text-ink-2">شوف صور {colorLabel ?? 'اللون'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[null, ...colors].map((c) => {
              const on = c === color;
              return (
                <button
                  key={c ?? 'all'}
                  type="button"
                  onClick={() => pickColor(c)}
                  aria-pressed={on}
                  className={clsx(
                    'inline-flex min-h-11 items-center rounded-full border px-4 text-ui font-semibold',
                    on ? 'border-ink bg-ink text-ground' : 'border-line-strong bg-surface text-ink-2 hover:border-brand',
                  )}
                >
                  {c ?? 'كل الصور'}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
