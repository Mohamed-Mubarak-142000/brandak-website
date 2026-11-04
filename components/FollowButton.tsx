'use client';

import { UserCheck, UserPlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api, ApiError, errorMessage, looksSignedIn } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

type FollowState = { following: boolean; followers: number };

/** Follow a store: its new products and sales reach the customer's following feed and notifications. */
export function FollowButton({ brandId, className }: { brandId: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<FollowState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get<FollowState>(`brands/${brandId}/follow`)
      .then((s) => alive && setState(s))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [brandId]);

  if (seller) return null;
  const on = !!state?.following;
  const count = state?.followers ?? 0;

  const toggle = async () => {
    if (!looksSignedIn()) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = on ? await api.delete<FollowState>(`brands/${brandId}/follow`) : await api.post<FollowState>(`brands/${brandId}/follow`);
      setState(next);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) router.push(`/login?next=${encodeURIComponent(pathname)}`);
      else if (e instanceof ApiError && e.code === 'SELLER_ACCOUNT') setSeller(true);
      else setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={on}
        className={cn(
          'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6 font-bold transition-colors disabled:cursor-wait disabled:opacity-70',
          on ? 'border border-line-strong bg-surface text-ink hover:border-brand' : 'bg-accent text-on-accent hover:bg-accent-hover',
          className,
        )}
      >
        {on ? <UserCheck aria-hidden className="size-5" /> : <UserPlus aria-hidden className="size-5" />}
        {on ? 'بتتابعه' : 'تابع المتجر'}
        {count ? <span className={cn('text-ui font-semibold', on ? 'text-ink-3' : 'text-on-accent/85')}>· {num(count)}</span> : null}
      </button>
      {error ? (
        <span role="alert" className="text-meta text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
