'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Jumps to the top of the page whenever the route path changes.
 * Next's own scroll-on-navigate is unreliable here: the header sits outside the page
 * segment and <html> has `scroll-behavior: smooth`, so the new page could open mid-way down.
 * Back/forward navigation is left alone so the browser restores where the visitor was.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isHistoryNav = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => {
      isHistoryNav.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
