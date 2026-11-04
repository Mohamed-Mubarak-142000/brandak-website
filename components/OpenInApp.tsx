'use client';

import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';
import { androidIntent, downloadHref, type AppPath } from '@/lib/links';

const noop = () => () => {};
const isAndroid = () => /android/i.test(navigator.userAgent);

/**
 * The only way to act on the site: opens `path` in the app. On Android it's an intent link that
 * opens the app or falls back to Google Play by itself; elsewhere it goes to /download, which shows
 * a QR code for the same screen. The server renders the /download link; Android swaps it on mount.
 */
export function OpenInApp({
  path,
  children,
  variant = 'primary',
  className,
}: {
  path: AppPath;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet';
  className?: string;
}) {
  const android = useSyncExternalStore(noop, isAndroid, () => false);
  const href = android ? androidIntent(path) : downloadHref(path);

  return (
    <a
      href={href}
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 font-bold transition-colors duration-150',
        variant === 'primary' && 'bg-accent text-on-accent hover:bg-accent-hover',
        variant === 'secondary' && 'border border-line-strong bg-surface text-ink hover:border-brand',
        variant === 'quiet' && 'px-0 text-accent underline-offset-4 hover:underline',
        className,
      )}
    >
      {children}
    </a>
  );
}
