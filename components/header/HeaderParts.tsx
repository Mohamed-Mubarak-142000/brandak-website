'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

/** The sticky header; gains a soft shadow once the page has scrolled. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('sticky top-0 z-40 bg-surface/95 backdrop-blur transition-shadow duration-200', scrolled ? 'shadow-header' : 'border-b border-line')}>
      {children}
    </header>
  );
}

/** A nav link that marks the current section. */
export function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex min-h-11 items-center gap-1.5 px-1 text-ui font-semibold text-ink-2 transition-colors hover:text-ink',
        "after:absolute after:inset-x-1 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand after:opacity-0 after:transition-opacity aria-[current=page]:text-ink aria-[current=page]:after:opacity-100",
        className,
      )}
    >
      {children}
    </Link>
  );
}
