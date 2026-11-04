import { Clock, Globe, Package, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { FollowButton } from '@/components/FollowButton';
import { OpenInApp } from '@/components/OpenInApp';
import { Rating } from '@/components/Rating';
import { StoreLogo } from '@/components/StoreCard';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { excerpt, plainText } from '@/lib/format';
import { appPath } from '@/lib/links';
import type { PublicBrand } from '@/lib/types';

import { countOf, days } from './words';

type IconProps = { className?: string };

// lucide dropped brand marks, so the three networks are drawn here.
const Instagram = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const Facebook = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TikTok = ({ className }: IconProps) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.2 2.5c.3 2.4 1.9 4.1 4.3 4.3v3.4a7.6 7.6 0 0 1-4.3-1.4v6.6a6 6 0 1 1-6-6v3.4a2.6 2.6 0 1 0 2.6 2.6V2.5h3.4z" />
  </svg>
);

const SOCIAL = [
  { key: 'instagram', label: 'إنستجرام', base: 'https://instagram.com/', icon: Instagram },
  { key: 'facebook', label: 'فيسبوك', base: 'https://facebook.com/', icon: Facebook },
  { key: 'tiktok', label: 'تيك توك', base: 'https://tiktok.com/@', icon: TikTok },
  { key: 'website', label: 'موقع المتجر', base: 'https://', icon: Globe },
] as const;

/** Sellers type either a full link or a handle; both become a link. */
function socialHref(value: string, base: string) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return base + v.replace(/^@/, '').replace(/^\/+/, '');
}

export function storeSocials(store: PublicBrand) {
  return SOCIAL.flatMap((s) => {
    const value = store.socialLinks?.[s.key];
    return value?.trim() ? [{ ...s, href: socialHref(value, s.base) }] : [];
  });
}

export function SocialLinks({ store }: { store: PublicBrand }) {
  const socials = storeSocials(store);
  if (!socials.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`${store.name} على السوشيال ميديا`}>
      {socials.map(({ key, label, href, icon: Icon }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={label}
            title={label}
            className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface text-ink-2 transition-colors hover:border-brand hover:text-accent"
          >
            <Icon className="size-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Cover, logo over its edge, name, type, rating, a few facts, the start of the story, and the actions. */
export function StoreHeader({ store, productCount }: { store: PublicBrand; productCount: number }) {
  const s = store.shipping;
  const zones = s?.zones?.length ?? 0;
  const description = plainText(store.description ?? '');
  const short = excerpt(description, 180);
  const cut = short.length < description.replace(/\s+/g, ' ').length;

  const facts = [
    productCount ? { icon: Package, text: countOf(productCount, 'منتج', 'منتجات') } : null,
    zones ? { icon: Truck, text: `بيوصّل لـ ${countOf(zones, 'محافظة', 'محافظات')}` } : s?.defaultFee != null ? { icon: Truck, text: 'بيوصّل لكل المحافظات' } : null,
    s ? { icon: Clock, text: s.processingDays > 0 ? `بيجهّز الطلب في ${days(s.processingDays)}` : 'بيجهّز الطلب في نفس اليوم' } : null,
  ].filter((f) => f !== null);

  return (
    <header>
      <div className="relative aspect-2/1 overflow-hidden rounded-window bg-sunken sm:aspect-3/1 lg:aspect-4/1">
        {store.coverUrl ? (
          <Image src={store.coverUrl} alt={`غلاف ${store.name}`} fill priority sizes="(min-width: 1152px) 1104px, 100vw" className="object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-linear-to-l from-accent-soft via-sunken to-sunken" />
        )}
      </div>

      <div className="px-1 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <StoreLogo store={store} size={128} className="-mt-12 size-24! border-4 border-surface shadow-card sm:-mt-16 sm:size-32!" />
          <div className="min-w-0 flex-1 md:pb-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-page font-extrabold break-words sm:text-display">{store.name}</h1>
              <StoreTypeBadge type={store.storeType} className="py-1 text-ui" />
            </div>
            <Rating avg={store.ratingAvg} count={store.ratingCount} className="mt-1 text-ui" />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:mb-1">
            <FollowButton brandId={store.id} />
            <OpenInApp path={appPath.brand(store.slug)} variant="secondary" className="px-5">
              افتح في التطبيق
            </OpenInApp>
            <SocialLinks store={store} />
          </div>
        </div>

        {facts.length ? (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-ui text-ink-2">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex items-center gap-1.5">
                <Icon aria-hidden className="size-4 text-brand" />
                {text}
              </li>
            ))}
          </ul>
        ) : null}

        {short ? (
          <p className="mt-4 max-w-3xl text-body text-ink-2">
            {short}{' '}
            {cut ? (
              <Link href="#about" className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                اقرا أكتر
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </header>
  );
}
