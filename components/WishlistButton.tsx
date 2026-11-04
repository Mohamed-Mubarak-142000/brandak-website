'use client';

import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { SESSION_CHANGED } from '@/components/header/AccountNav';
import { api, ApiError, looksSignedIn } from '@/lib/client-api';
import { cn } from '@/lib/cn';

/*
 * The saved product ids, fetched once per session (`wishlists/me/ids`) and shared by every heart
 * on the page. Toggles are optimistic and roll back if the API says no.
 */
type Status = 'idle' | 'loading' | 'ready' | 'out' | 'seller';
let ids = new Set<string>();
let status: Status = 'idle';
let version = 0;
const listeners = new Set<() => void>();
let watching = false;

function emit() {
  version++;
  listeners.forEach((l) => l());
}

function load() {
  if (status !== 'idle') return;
  if (!looksSignedIn()) {
    status = 'out';
    return;
  }
  status = 'loading';
  api
    .get<string[]>('wishlists/me/ids')
    .then((r) => {
      ids = new Set(r ?? []);
      status = 'ready';
    })
    .catch((e) => {
      ids = new Set();
      // Store accounts can't keep a wishlist: hide the hearts, like the app.
      status = e instanceof ApiError && e.code === 'SELLER_ACCOUNT' ? 'seller' : e instanceof ApiError && e.status === 401 ? 'out' : 'ready';
    })
    .finally(emit);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!watching) {
    watching = true;
    window.addEventListener(SESSION_CHANGED, () => {
      ids = new Set();
      status = 'idle';
      load();
      emit();
    });
  }
  load();
  return () => listeners.delete(cb);
}

/** Saved ids, as a hook: `has(id)` and `toggle(id)`. */
export function useWishlist() {
  useSyncExternalStore(subscribe, () => version, () => 0);
  return {
    status,
    has: (id: string) => ids.has(id),
    async toggle(id: string) {
      const on = !ids.has(id);
      const next = new Set(ids);
      if (on) next.add(id);
      else next.delete(id);
      ids = next;
      emit();
      try {
        if (on) await api.post('wishlists/me/items', { productId: id });
        else await api.delete(`wishlists/me/items/${id}`);
        return true;
      } catch (e) {
        const back = new Set(ids);
        if (on) back.delete(id);
        else back.add(id);
        ids = back;
        if (e instanceof ApiError && e.code === 'SELLER_ACCOUNT') status = 'seller';
        if (e instanceof ApiError && e.status === 401) status = 'out';
        emit();
        return false;
      }
    },
  };
}

/** A heart that saves the product to المفضلة. Signed out → login, back to this page. */
export function WishlistButton({ productId, title, className, variant = 'floating' }: { productId: string; title?: string; className?: string; variant?: 'floating' | 'outline' }) {
  const w = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  if (w.status === 'seller') return null;
  const on = w.has(productId);
  const name = title ? ` «${title}»` : '';

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `شيل${name} من المفضلة` : `ضيف${name} للمفضلة`}
      title={on ? 'في المفضلة' : 'ضيف للمفضلة'}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!looksSignedIn() || w.status === 'out') {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        const ok = await w.toggle(productId);
        if (!ok && !looksSignedIn()) router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }}
      className={cn(
        'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-[transform,background-color,border-color] active:scale-90',
        variant === 'floating' ? 'bg-surface/90 shadow-card backdrop-blur-sm hover:bg-surface' : 'border border-line-strong bg-surface hover:border-brand',
        className,
      )}
    >
      <Heart aria-hidden className={cn('size-5 transition-colors', on ? 'fill-danger text-danger' : 'text-ink')} strokeWidth={2} />
    </button>
  );
}
