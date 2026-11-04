'use client';

import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

import { swatch } from './colors';

/**
 * Main photo + thumbnails (a column on the start side on wide screens, a row below otherwise).
 * When photos are tagged by colour (imageColors), colour buttons filter the photos to that colour;
 * untagged photos (null) belong to every colour. On desktop the photo zooms toward the pointer.
 */
export function Gallery({ images, imageColors, title, colorLabel }: { images: string[]; imageColors?: (string | null)[]; title: string; colorLabel?: string }) {
  const colors = useMemo(() => {
    const seen: string[] = [];
    for (const c of imageColors ?? []) if (c && !seen.includes(c)) seen.push(c);
    return seen;
  }, [imageColors]);

  const [color, setColor] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState('50% 50%');

  const shown = useMemo(() => {
    const all = images.map((src, i) => ({ src, color: imageColors?.[i] ?? null }));
    if (!color) return all;
    const match = all.filter((p) => p.color === null || p.color === color);
    return match.length ? match : all;
  }, [images, imageColors, color]);

  const index = Math.min(active, shown.length - 1);
  const current = shown[index];
  const many = shown.length > 1;
  const go = (step: number) => setActive((index + step + shown.length) % shown.length);

  const pickColor = (c: string | null) => {
    setColor(c);
    setActive(0);
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col-reverse gap-3 xl:flex-row">
        {many ? (
          <ul className="rail flex shrink-0 gap-2 overflow-x-auto pb-1 xl:max-h-[34rem] xl:w-20 xl:flex-col xl:overflow-y-auto xl:overflow-x-visible xl:pb-0" aria-label="صور المنتج">
            {shown.map((p, i) => {
              const on = i === index;
              return (
                <li key={p.src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`صورة ${num(i + 1)} من ${num(shown.length)}`}
                    aria-current={on ? 'true' : undefined}
                    className={cn(
                      'relative block size-16 cursor-pointer overflow-hidden rounded-card border bg-sunken transition sm:size-20',
                      on ? 'border-ink ring-1 ring-ink' : 'border-line opacity-75 hover:opacity-100',
                    )}
                  >
                    <Image src={p.src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="group relative aspect-square min-w-0 flex-1 overflow-hidden rounded-panel border border-line bg-sunken">
          {current ? (
            <div
              className="absolute inset-0 lg:cursor-zoom-in"
              onPointerMove={(e) => {
                if (e.pointerType !== 'mouse') return;
                const r = e.currentTarget.getBoundingClientRect();
                setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              }}
            >
              <Image
                key={current.src}
                src={current.src}
                alt={color ? `${title}، لون ${color}` : title}
                fill
                priority
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 50vw, 100vw"
                style={{ transformOrigin: origin }}
                className="object-cover transition-transform duration-200 ease-out lg:group-hover:scale-[1.8]"
              />
            </div>
          ) : (
            <Package aria-hidden className="absolute inset-0 m-auto size-14 text-ink-3" />
          )}

          {many ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="الصورة اللي قبلها"
                className="absolute inset-s-3 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-surface/90 text-ink shadow-card transition-opacity hover:bg-surface lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="الصورة اللي بعدها"
                className="absolute inset-e-3 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-surface/90 text-ink shadow-card transition-opacity hover:bg-surface lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <span className="pointer-events-none absolute bottom-3 inset-s-3 rounded-full bg-ink/70 px-2.5 py-0.5 text-meta font-semibold text-white">
                {num(index + 1)} / {num(shown.length)}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {colors.length > 1 ? (
        <div className="mt-4">
          <p className="text-meta font-semibold text-ink-2">شوف صور {colorLabel ?? 'اللون'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[null, ...colors].map((c) => {
              const on = c === color;
              const hex = c ? swatch(c) : null;
              return (
                <button
                  key={c ?? 'all'}
                  type="button"
                  onClick={() => pickColor(c)}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-ui font-semibold transition-colors',
                    on ? 'border-ink bg-ink text-ground' : 'border-line-strong bg-surface text-ink-2 hover:border-ink',
                  )}
                >
                  {hex ? <span aria-hidden className="size-4 rounded-full border border-black/15" style={{ background: hex }} /> : null}
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
