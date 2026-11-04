'use client';

import { Bot, ExternalLink, LayoutGrid, MessageCircleQuestion, Package, Settings, Shirt, Sparkles, Star, TicketPercent, Undo2, Wallet, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { OpenInApp } from '@/components/OpenInApp';
import { StoreLogo } from '@/components/StoreCard';
import { StoreTypeBadge } from '@/components/StoreTypeBadge';
import { cn } from '@/lib/cn';
import type { BrandStatus, StoreType } from '@/lib/types';

import { BrandStatusPill } from './bits';

/** The AI copilot sends owners to these exact paths; keep them stable. */
export const SELLER_LINKS = [
  { href: '/seller', label: 'نظرة عامة', icon: LayoutGrid },
  { href: '/seller/orders', label: 'الطلبات', icon: Package },
  { href: '/seller/products', label: 'المنتجات', icon: Shirt },
  { href: '/seller/settings', label: 'إعدادات المتجر', icon: Settings },
  { href: '/seller/assistant', label: 'مساعد المتجر', icon: Bot },
  { href: '/seller/copilot', label: 'مساعدك الذكي', icon: Sparkles },
] as const;

/** Store tools that live in the app only (paths after `fatrina://`). */
export const APP_ONLY_LINKS = [
  { path: 'seller/coupons', label: 'الكوبونات والعروض', icon: TicketPercent },
  { path: 'seller/questions', label: 'أسئلة العملاء', icon: MessageCircleQuestion },
  { path: 'seller/returns', label: 'المرتجعات والشكاوى', icon: Undo2 },
  { path: 'seller/reviews', label: 'التقييمات', icon: Star },
  { path: 'seller/ads', label: 'الإعلانات', icon: Megaphone },
  { path: 'seller/balance', label: 'حسابي مع فاترينة', icon: Wallet },
] as const;

const isActive = (pathname: string, href: string) => (href === '/seller' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

export interface NavBrand {
  name: string;
  slug: string;
  logoUrl: string | null;
  storeType: StoreType;
  status: BrandStatus;
}

/** Sticky side panel on large screens; a scrollable row of pills on phones. */
export function SellerNav({ brand }: { brand: NavBrand }) {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="لوحة المتجر" className="hidden lg:block">
        <div className="rounded-panel border border-line bg-surface p-3 shadow-card">
          <div className="flex items-center gap-3 border-b border-line px-2 pb-4 pt-2">
            <StoreLogo store={brand} size={48} />
            <div className="min-w-0">
              <p className="truncate font-bold">{brand.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <StoreTypeBadge type={brand.storeType} />
                <BrandStatusPill status={brand.status} />
              </div>
            </div>
          </div>
          <ul className="mt-2 flex flex-col gap-0.5">
            {SELLER_LINKS.map(({ href, label, icon: Icon }) => {
              const on = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-card px-3 text-ui font-semibold transition-colors',
                      on ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-sunken hover:text-ink',
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-line pt-3">
            <p className="px-3 pb-1 text-meta font-bold text-ink-3">في التطبيق</p>
            <ul className="flex flex-col gap-0.5">
              {APP_ONLY_LINKS.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <OpenInApp
                    path={path}
                    variant="quiet"
                    className="flex min-h-11 w-full justify-start gap-3 rounded-card px-3 text-ui font-semibold text-ink-2 no-underline hover:bg-sunken hover:text-ink hover:no-underline"
                  >
                    <Icon aria-hidden className="size-4" />
                    <span className="flex-1">{label}</span>
                    <ExternalLink aria-hidden className="size-3.5 text-ink-3" />
                  </OpenInApp>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 border-t border-line pt-2">
            <Link href={`/brand/${brand.slug}`} className="flex min-h-11 items-center gap-3 rounded-card px-3 text-ui font-semibold text-accent hover:bg-accent-soft">
              شوف متجرك زي العميل
            </Link>
          </div>
        </div>
      </nav>

      <div className="lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <StoreLogo store={brand} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{brand.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <StoreTypeBadge type={brand.storeType} />
              <BrandStatusPill status={brand.status} />
            </div>
          </div>
        </div>
        <nav aria-label="لوحة المتجر" className="-mx-4 sm:-mx-6">
          <ul className="rail flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6">
            {SELLER_LINKS.map(({ href, label, icon: Icon }) => {
              const on = isActive(pathname, href);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-ui font-bold whitespace-nowrap transition-colors',
                      on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface text-ink-2 hover:border-brand',
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li aria-hidden className="w-px shrink-0 self-stretch bg-line" />
            {APP_ONLY_LINKS.map(({ path, label, icon: Icon }) => (
              <li key={path} className="shrink-0">
                <OpenInApp path={path} variant="secondary" className="min-h-11 gap-2 px-4 text-ui whitespace-nowrap text-ink-2">
                  <Icon aria-hidden className="size-4" />
                  {label}
                  <span className="sr-only">(في التطبيق)</span>
                </OpenInApp>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
