'use client';

import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, X } from 'lucide-react';
import { useId, useRef } from 'react';

import { swatch } from '@/components/product/colors';
import { cn } from '@/lib/cn';

export interface Img {
  key: string;
  fileId?: string;
  url: string;
  uploading?: boolean;
  /** The variant colour this photo shows; null = every colour. */
  color: string | null;
}

const ctl = 'grid size-9 cursor-pointer place-items-center rounded-full bg-surface/95 text-ink shadow-card hover:text-accent disabled:cursor-not-allowed disabled:opacity-40';

/** Product photos: add several, reorder (first = cover), remove, and pick the colour each shows. */
export function ImagesField({
  images,
  max,
  colors,
  error,
  onAdd,
  onChange,
}: {
  images: Img[];
  max: number;
  colors: string[];
  error?: string;
  onAdd: (files: File[]) => void;
  onChange: (next: Img[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const noteId = useId();
  const move = (i: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    onChange(next);
  };

  return (
    <section aria-labelledby={`${noteId}-t`} className="flex flex-col gap-2">
      <h2 id={`${noteId}-t`} className="font-bold">
        الصور ({images.length}/{max})
      </h2>
      <p id={noteId} className={cn('text-meta', error ? 'font-semibold text-danger' : 'text-ink-3')} role={error ? 'alert' : undefined}>
        {error ??
          (colors.length > 1
            ? 'الصورة الأولى هي الغلاف. حدد لون كل صورة عشان العميل لما يختار لون يشوف صوره هو بس.'
            : 'الصورة الأولى هي الغلاف. استخدم الأسهم عشان ترتّب الصور، والنجمة عشان تخلّي صورة غلاف.')}
      </p>
      <ul className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5">
        {images.map((img, i) => (
          <li key={img.key} className="flex min-w-0 flex-col gap-1.5">
            <div className={cn('relative aspect-4/5 overflow-hidden rounded-card border-2 bg-sunken', i === 0 ? 'border-brand' : 'border-line')}>
              {/* Local previews are blob: URLs, which next/image can't take. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`صورة ${i + 1}${i === 0 ? ' (الغلاف)' : ''}`} className="absolute inset-0 size-full object-cover" />
              {img.uploading ? (
                <div className="absolute inset-0 grid place-items-center bg-ink/40">
                  <LoaderCircle aria-label="بترفع" className="size-7 animate-spin text-white" />
                </div>
              ) : null}
              <div className="absolute inset-x-1 top-1 flex justify-between">
                {i > 0 ? (
                  <button type="button" className={ctl} onClick={() => move(i, 0)} aria-label={`اجعل صورة ${i + 1} الغلاف`}>
                    <Star aria-hidden className="size-4" />
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" className={cn(ctl, 'hover:text-danger')} onClick={() => onChange(images.filter((x) => x.key !== img.key))} aria-label={`حذف صورة ${i + 1}`}>
                  <X aria-hidden className="size-4" />
                </button>
              </div>
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                {/* RTL: "earlier" sits to the right. */}
                <button type="button" className={ctl} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`حرّك صورة ${i + 1} لقدّام`}>
                  <ArrowRight aria-hidden className="size-4" />
                </button>
                <button type="button" className={ctl} onClick={() => move(i, i + 1)} disabled={i === images.length - 1} aria-label={`حرّك صورة ${i + 1} لورا`}>
                  <ArrowLeft aria-hidden className="size-4" />
                </button>
              </div>
              {i === 0 ? <span className="absolute inset-x-0 bottom-11 mx-auto w-fit rounded-full bg-brand px-2 text-meta font-bold text-white">الغلاف</span> : null}
            </div>
            {colors.length ? (
              <label className="relative">
                <span className="sr-only">لون صورة {i + 1}</span>
                {img.color && swatch(img.color) ? (
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 inset-s-2.5 my-auto size-3.5 rounded-full border border-line-strong" style={{ backgroundColor: swatch(img.color)! }} />
                ) : null}
                <select
                  value={img.color ?? ''}
                  onChange={(e) => onChange(images.map((x) => (x.key === img.key ? { ...x, color: e.target.value || null } : x)))}
                  className={cn(
                    'min-h-9 w-full cursor-pointer truncate rounded-full border bg-surface px-2.5 text-meta',
                    img.color ? 'border-brand bg-accent-soft font-bold text-accent' : 'border-line-strong text-ink-2',
                    img.color && swatch(img.color) && 'ps-7',
                  )}
                >
                  <option value="">كل الألوان</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </li>
        ))}
        {images.length < max ? (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              aria-describedby={noteId}
              className="flex aspect-4/5 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border-[1.5px] border-dashed border-line-strong bg-surface text-ink-3 hover:border-brand hover:text-accent"
            >
              <ImagePlus aria-hidden className="size-7" />
              <span className="text-meta font-bold">إضافة صور</span>
            </button>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              multiple
              hidden
              onChange={(e) => {
                const files = [...(e.target.files ?? [])].slice(0, max - images.length);
                e.target.value = '';
                if (files.length) onAdd(files);
              }}
            />
          </li>
        ) : null}
      </ul>
    </section>
  );
}
