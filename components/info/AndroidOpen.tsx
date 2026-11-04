'use client';

import { Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

import { androidIntent, PLAY_URL, type AppPath } from '@/lib/links';

/**
 * On Android, hands the visitor straight to the app (or to Google Play when it isn't installed)
 * through an intent URL, and keeps a button on screen in case the browser blocks the automatic
 * jump. Renders nothing elsewhere.
 */
export function AndroidOpen({ path, serverGuess }: { path: AppPath; serverGuess: boolean }) {
  const [android, setAndroid] = useState(serverGuess);

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    // Correct the server's user-agent guess once we can read the real one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAndroid(isAndroid);
    if (isAndroid) window.location.replace(androidIntent(path));
  }, [path]);

  if (!android) return null;

  return (
    <div className="rounded-panel border border-line bg-surface p-5 sm:p-6">
      <p className="text-section font-extrabold">بنفتحلك فاترينة دلوقتي…</p>
      <p className="mt-1 text-ink-2">لو التطبيق مش متسطّب، هيفتحلك Google Play تنزّله منه.</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={androidIntent(path)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent hover:bg-accent-hover"
        >
          <Smartphone aria-hidden className="size-5" />
          افتح التطبيق
        </a>
        <a href={PLAY_URL} className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
          حمّله من Google Play
        </a>
      </div>
    </div>
  );
}
