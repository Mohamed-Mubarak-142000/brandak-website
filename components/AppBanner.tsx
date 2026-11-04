'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';

import { OpenInApp } from './OpenInApp';

const KEY = 'fatrina.appBanner.dismissed';

/** A thin "open in the app" strip on phones. Closing it is remembered on this device. */
const noop = () => () => {};
const wasDismissed = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export function AppBanner() {
  // Hidden on the server render; shown after hydration unless closed before on this device.
  const dismissed = useSyncExternalStore(noop, wasDismissed, () => true);
  const [closed, setClosed] = useState(false);

  if (dismissed || closed) return null;

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(KEY, '1');
    } catch {}
  };

  return (
    <div className="flex items-center gap-3 border-b border-line bg-sunken px-4 py-2 md:hidden">
      <button type="button" onClick={close} aria-label="اقفل" className="-m-2 grid size-11 shrink-0 place-items-center text-ink-3">
        <X className="size-4" aria-hidden />
      </button>
      <Image src="/brand/fatrina-icon.png" alt="" width={36} height={36} className="rounded-lg" />
      <p className="min-w-0 flex-1 text-meta leading-tight text-ink-2">
        <span className="block font-bold text-ink">فاترينة على موبايلك</span>
        اطلب، تابع طلبك، واجمع نقاط
      </p>
      <OpenInApp path="" className="min-h-9 px-4 text-meta">
        افتح
      </OpenInApp>
    </div>
  );
}
