'use client';

import { ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { UploadPurpose, UploadResult } from '@/lib/seller-types';

import { sellerError } from './errors';

export interface UploadedImage {
  fileId: string;
  url: string | null;
}

const MAX = 4 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Upload one image file to POST /uploads and get its id back. */
export async function uploadImage(file: File, purpose: UploadPurpose): Promise<UploadedImage> {
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', file);
  const res = await api.upload<UploadResult>('uploads', form);
  return { fileId: res.id, url: res.url };
}

/**
 * Pick → uploads right away → hands the file id to the form. Shows a local preview while it
 * uploads and keeps the old image if the upload fails.
 */
export function ImageUpload({
  label,
  purpose,
  value,
  onChange,
  round,
  className,
  hint = 'JPG أو PNG أو WEBP، لحد 4 ميجا',
}: {
  label: string;
  purpose: UploadPurpose;
  value: UploadedImage | null;
  onChange: (v: UploadedImage) => void | Promise<void>;
  round?: boolean;
  className?: string;
  hint?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!TYPES.includes(file.type)) return setError('الصورة لازم تكون JPG أو PNG أو WEBP.');
    if (file.size > MAX) return setError('الصورة أكبر من 4 ميجا. صغّرها وجرّب تاني.');
    const local = URL.createObjectURL(file);
    setPreview(local);
    setBusy(true);
    try {
      await onChange(await uploadImage(file, purpose));
    } catch (e) {
      setPreview(null);
      setError(sellerError(e, 'معرفناش نرفع الصورة. جرّب تاني.'));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const src = preview ?? value?.url ?? null;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span id={`${id}-label`} className="text-ui font-semibold text-ink">
        {label}
      </span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-note`}
        className={cn(
          'group relative grid cursor-pointer place-items-center overflow-hidden border border-dashed border-line-strong bg-sunken text-ink-3 transition-colors hover:border-brand hover:text-accent disabled:cursor-wait',
          round ? 'size-28 rounded-full' : 'aspect-[16/7] w-full rounded-card',
        )}
      >
        {src ? (
          // A local blob preview or the uploaded URL; next/image can't take blob: URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <span
          className={cn(
            'relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-meta font-bold',
            src ? 'bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100' : '',
            busy && 'opacity-100',
          )}
        >
          {busy ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : src ? <RefreshCw aria-hidden className="size-4" /> : <ImagePlus aria-hidden className="size-5" />}
          {busy ? 'بنرفع...' : src ? 'تغيير' : 'اختار صورة'}
        </span>
      </button>
      <input ref={input} type="file" accept={TYPES.join(',')} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
      <p id={`${id}-note`} role={error ? 'alert' : undefined} className={cn('text-meta', error ? 'font-semibold text-danger' : 'text-ink-3')}>
        {error ?? hint}
      </p>
    </div>
  );
}
