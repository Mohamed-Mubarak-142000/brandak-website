import { AtSign, Globe, Store } from 'lucide-react';
import Image from 'next/image';

import { Awning } from '@/components/Awning';
import { OpenInApp } from '@/components/OpenInApp';
import { Rating } from '@/components/Rating';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { excerpt, plainText } from '@/lib/format';
import { appPath } from '@/lib/links';
import type { PublicBrand } from '@/lib/types';

const SOCIAL = [
  { key: 'instagram', label: 'إنستجرام', base: 'https://instagram.com/', icon: AtSign },
  { key: 'facebook', label: 'فيسبوك', base: 'https://facebook.com/', icon: AtSign },
  { key: 'tiktok', label: 'تيك توك', base: 'https://tiktok.com/@', icon: AtSign },
  { key: 'website', label: 'الموقع', base: 'https://', icon: Globe },
] as const;

/** Sellers type either a full link or a handle; both become a link. */
function socialHref(value: string, base: string) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return base + v.replace(/^@/, '').replace(/^\/+/, '');
}

function Description({ text }: { text: string }) {
  const full = plainText(text);
  if (!full) return null;
  const short = excerpt(full, 220);
  if (short.length >= full.replace(/\s+/g, ' ').length) {
    return <p className="mt-3 max-w-3xl whitespace-pre-line text-body text-ink-2">{full}</p>;
  }
  return (
    <details className="group mt-3 max-w-3xl text-body text-ink-2">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{short} </span>
        <span className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline group-open:hidden">اقرا أكتر</span>
        <span className="hidden min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline group-open:inline-flex">اقرا أقل</span>
      </summary>
      <p className="whitespace-pre-line">{full}</p>
    </details>
  );
}

export function StoreHeader({ store }: { store: PublicBrand }) {
  const socials = SOCIAL.flatMap((s) => {
    const value = store.socialLinks?.[s.key];
    return value ? [{ ...s, href: socialHref(value, s.base) }] : [];
  });

  return (
    <header>
      <div className="relative aspect-[5/2] overflow-hidden rounded-window bg-sunken sm:aspect-[4/1]">
        {store.coverUrl ? (
          <Image src={store.coverUrl} alt={`غلاف ${store.name}`} fill priority sizes="(min-width: 1152px) 1104px, 100vw" className="object-cover" />
        ) : (
          <Awning tone="soft" className="absolute inset-x-0 top-0 h-7" />
        )}
      </div>

      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
        <div className="-mt-12 size-24 shrink-0 overflow-hidden rounded-full border-4 border-ground bg-surface sm:-mt-16 sm:size-32">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={`لوجو ${store.name}`} width={128} height={128} priority className="size-full object-cover" />
          ) : (
            <Store aria-hidden className="m-auto mt-7 size-9 text-ink-3 sm:mt-10 sm:size-11" />
          )}
        </div>
        <div className="min-w-0 flex-1 sm:pb-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="font-sign text-page break-words sm:text-display">{store.name}</h1>
            <StoreTypeBadge type={store.storeType} />
          </div>
          <Rating avg={store.ratingAvg} count={store.ratingCount} className="mt-1" />
        </div>
        <OpenInApp path={appPath.brand(store.slug)} className="shrink-0 sm:mb-1">
          تابع المتجر في التطبيق
        </OpenInApp>
      </div>

      <div className="px-1 sm:px-6">
        <Description text={store.description ?? ''} />
        {socials.length ? (
          <ul className="mt-3 flex flex-wrap gap-x-5" aria-label="المتجر على السوشيال ميديا">
            {socials.map(({ key, label, href, icon: Icon }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex min-h-11 items-center gap-1.5 text-ui font-semibold text-ink-2 hover:text-accent">
                  <Icon aria-hidden className="size-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  );
}
