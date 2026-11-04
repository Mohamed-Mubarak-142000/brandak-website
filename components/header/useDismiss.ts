'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type RefObject } from 'react';

/**
 * Open/close state for a menu that closes the way people expect: clicking outside `ref`, pressing
 * Escape (focus goes back to `returnFocus`), or navigating to another page.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, returnFocus?: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // A new page closes the menu (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      returnFocus?.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, returnFocus]);

  return [open, setOpen] as const;
}
