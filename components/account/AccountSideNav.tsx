'use client';

import { Coins, Heart, LayoutGrid, LogOut, MapPin, Package, Settings, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { notifySessionChanged } from '@/components/header/AccountNav';
import { auth } from '@/lib/client-api';
import { cn } from '@/lib/cn';

export const ACCOUNT_LINKS = [
  { href: '/account', label: 'نظرة عامة', icon: LayoutGrid },
  { href: '/account/orders', label: 'طلباتي', icon: Package },
  { href: '/account/addresses', label: 'العناوين', icon: MapPin },
  { href: '/account/wishlist', label: 'المفضلة', icon: Heart },
  { href: '/account/following', label: 'المتاجر اللي بتابعها', icon: Store },
  { href: '/account/points', label: 'نقاطي', icon: Coins },
  { href: '/account/settings', label: 'الإعدادات', icon: Settings },
] as const;

const isActive = (pathname: string, href: string) => (href === '/account' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await auth.logout();
        notifySessionChanged();
        router.replace('/');
        router.refresh();
      }}
      className={cn('flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-card px-3 text-ui font-semibold text-danger hover:bg-danger-soft disabled:opacity-60', className)}
    >
      <LogOut aria-hidden className="size-4" />
      {busy ? 'بنخرّجك...' : 'خروج'}
    </button>
  );
}

/** Side list on large screens, a scrollable row of pills on phones. */
export function AccountSideNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="حسابي" className="hidden lg:block">
        <div className="rounded-panel border border-line bg-surface p-3 shadow-card">
          <div className="flex items-center gap-3 border-b border-line px-2 pb-4 pt-2">
            <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-section font-extrabold text-accent">
              {name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold">{name}</p>
              <p dir="ltr" className="truncate text-end text-meta text-ink-3">
                {email}
              </p>
            </div>
          </div>
          <ul className="mt-2 flex flex-col gap-0.5">
            {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => {
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
          <div className="mt-2 border-t border-line pt-2">
            <SignOutButton />
          </div>
        </div>
      </nav>

      <nav aria-label="حسابي" className="-mx-4 sm:-mx-6 lg:hidden">
        <ul className="rail flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6">
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => {
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
        </ul>
      </nav>
    </>
  );
}
