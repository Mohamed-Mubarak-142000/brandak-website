import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';

/** The sign-in pages: one centred card on a light ground, logo on top. */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="bg-sunken px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-window border border-line bg-surface px-5 py-8 shadow-card sm:px-8 sm:py-10">
          <Link href="/" aria-label="فاترينة، الرئيسية" className="mx-auto mb-6 flex w-fit items-center gap-2">
            <Image src="/brand/fatrina-mark.png" alt="" width={44} height={44} className="size-11" />
            <span className="font-sign text-page text-brand">فاترينة</span>
          </Link>
          <h1 className="text-center text-page font-extrabold">{title}</h1>
          {subtitle ? <p className="mt-2 text-center text-ui text-ink-2 sm:text-body">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
        {footer ? <div className="mt-5 text-center text-ui text-ink-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export type AuthPerk = { icon: LucideIcon; title: string; text: string };

/**
 * Login and register: a two-pane window. The form sits on one side; on large screens a brand
 * panel (orange, shop-sign headline, a few reasons to sign in) sits on the other. Under `lg` the
 * panel drops and only the form remains, with the logo above it.
 */
export function AuthSplit({
  mode,
  next,
  title,
  subtitle,
  headline,
  perks,
  children,
  footer,
}: {
  mode: 'login' | 'register';
  next: string;
  title: string;
  subtitle?: React.ReactNode;
  headline: React.ReactNode;
  perks: AuthPerk[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const q = `?next=${encodeURIComponent(next)}`;
  const tabs = [
    { key: 'login', href: `/login${q}`, label: 'تسجيل الدخول' },
    { key: 'register', href: `/register${q}`, label: 'حساب جديد' },
  ] as const;

  return (
    <div className="bg-sunken px-4 py-8 sm:py-14">
      <div className="mx-auto grid w-full max-w-md overflow-hidden rounded-window border border-line bg-surface shadow-card lg:max-w-5xl lg:grid-cols-[1fr_1.05fr]">
        {/* Form pane (first in the DOM, so it reads first and sits on the right in RTL). */}
        <div className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <Link href="/" aria-label="فاترينة، الرئيسية" className="mb-7 flex w-fit items-center gap-2 lg:hidden">
            <Image src="/brand/fatrina-mark.png" alt="" width={40} height={40} className="size-10" />
            <span className="font-sign text-section text-brand">فاترينة</span>
          </Link>

          <nav aria-label="نوع الدخول" className="mb-8 grid grid-cols-2 rounded-full bg-sunken p-1">
            {tabs.map((t) => {
              const active = t.key === mode;
              return (
                <Link
                  key={t.key}
                  href={t.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'grid min-h-10 place-items-center rounded-full text-ui font-bold transition-colors',
                    active ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <h1 className="text-page font-extrabold">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-ui text-ink-2 sm:text-body">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-6 border-t border-line pt-5 text-center text-ui text-ink-2">{footer}</div> : null}
        </div>

        {/* Brand pane — decorative context, hidden on small screens. */}
        <aside className="relative hidden overflow-hidden bg-accent text-on-accent lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,var(--brand)_0,transparent_55%),radial-gradient(circle_at_0%_100%,rgb(0_0_0/0.18)_0,transparent_50%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgb(255_255_255)_1px,transparent_1px)] [background-size:18px_18px]" />

          <Link href="/" aria-label="فاترينة، الرئيسية" className="relative flex w-fit items-center gap-2.5">
            <span className="grid size-12 place-items-center rounded-panel bg-white shadow-card">
              <Image src="/brand/fatrina-mark.png" alt="" width={36} height={36} className="size-9" />
            </span>
            <span className="font-sign text-page">فاترينة</span>
          </Link>

          <div className="relative my-12">
            <p className="font-sign text-display leading-[1.25]">{headline}</p>
          </div>

          <ul className="relative flex flex-col gap-3">
            {perks.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex items-start gap-3 rounded-panel bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="grid size-10 shrink-0 place-items-center rounded-card bg-white text-accent">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span>
                  <span className="block text-body font-bold">{t}</span>
                  <span className="block text-ui text-white/80">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
