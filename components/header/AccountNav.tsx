'use client';

import { ChevronDown, LayoutDashboard, LogOut, Package, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { api, auth, looksSignedIn } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { CartSummary, Me } from '@/lib/types';

import { useDismiss } from './useDismiss';

/** Fired by anything that changes the cart (add, remove, order placed) so the badge refreshes. */
export const CART_CHANGED = 'fatrina:cart';
export const notifyCartChanged = () => window.dispatchEvent(new Event(CART_CHANGED));
/** Fired after sign-in / sign-out so the header picks up the new account. */
export const SESSION_CHANGED = 'fatrina:session';
export const notifySessionChanged = () => window.dispatchEvent(new Event(SESSION_CHANGED));

const noop = () => () => {};

/** Cart button with item count, and "دخول" or the account menu. Reads nothing when signed out. */
export function AccountNav() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [me, setMe] = useState<Me | null>(null);
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const load = useCallback(async () => {
    if (!looksSignedIn()) {
      setMe(null);
      setCount(0);
      return;
    }
    const [user, carts] = await Promise.all([api.get<Me>('users/me').catch(() => null), api.get<CartSummary[]>('carts').catch(() => [])]);
    setMe(user);
    setCount((carts ?? []).reduce((n, c) => n + c.itemsCount, 0));
  }, []);

  useEffect(() => {
    const run = () => void load();
    const t = setTimeout(run, 0);
    window.addEventListener(CART_CHANGED, run);
    window.addEventListener(SESSION_CHANGED, run);
    return () => {
      clearTimeout(t);
      window.removeEventListener(CART_CHANGED, run);
      window.removeEventListener(SESSION_CHANGED, run);
    };
  }, [load]);

  const signedIn = mounted && !!me;
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex items-center gap-1.5">
      <Link href="/cart" aria-label={count ? `السلة، فيها ${count} منتج` : 'السلة'} className="relative grid size-11 place-items-center rounded-full hover:bg-sunken">
        <ShoppingBag aria-hidden className="size-5" />
        {count ? (
          <span className="absolute end-1 top-1 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-white">{count > 99 ? '99+' : count}</span>
        ) : null}
      </Link>
      {signedIn ? (
        <AccountMenu me={me!} onSignedOut={() => setMe(null)} />
      ) : (
        <Link href={loginHref} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-ui font-bold hover:bg-sunken">
          <User aria-hidden className="size-5" />
          <span className="hidden sm:inline">دخول</span>
        </Link>
      )}
    </div>
  );
}

function AccountMenu({ me, onSignedOut }: { me: Me; onSignedOut: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useDismiss(wrap, button);
  const router = useRouter();
  const first = me.name.split(' ')[0];

  const signOut = async () => {
    await auth.logout();
    onSignedOut();
    notifySessionChanged();
    router.push('/');
    router.refresh();
  };

  const item = 'flex min-h-11 items-center gap-3 rounded-card px-3 text-ui font-semibold hover:bg-sunken';
  return (
    <div ref={wrap} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-2 text-ui font-bold hover:bg-sunken sm:px-3"
      >
        <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent">{first.slice(0, 1)}</span>
        <span className="hidden max-w-24 truncate sm:inline">{first}</span>
        <ChevronDown aria-hidden className={cn('hidden size-4 transition-transform sm:block', open && 'rotate-180')} />
      </button>
      <div hidden={!open} className="absolute end-0 top-full z-50 mt-2 w-60 rounded-panel border border-line bg-surface p-2 shadow-pop">
        <p className="truncate px-3 pb-2 pt-1 text-meta text-ink-3">{me.email}</p>
        <Link href="/account" onClick={() => setOpen(false)} className={item}>
          <User aria-hidden className="size-4 text-ink-3" />
          حسابي
        </Link>
        <Link href="/account/orders" onClick={() => setOpen(false)} className={item}>
          <Package aria-hidden className="size-4 text-ink-3" />
          طلباتي
        </Link>
        {me.brand ? (
          <Link href="/seller" onClick={() => setOpen(false)} className={cn(item, 'text-accent')}>
            <LayoutDashboard aria-hidden className="size-4" />
            لوحة متجري
          </Link>
        ) : (
          <Link href="/seller/apply" onClick={() => setOpen(false)} className={item}>
            <LayoutDashboard aria-hidden className="size-4 text-ink-3" />
            افتح متجرك
          </Link>
        )}
        <button type="button" onClick={signOut} className={cn(item, 'w-full cursor-pointer text-danger')}>
          <LogOut aria-hidden className="size-4" />
          خروج
        </button>
      </div>
    </div>
  );
}
