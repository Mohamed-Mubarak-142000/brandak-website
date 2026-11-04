import { ChevronDown, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { STORE_TYPES } from '@/lib/store-types';

import { Container } from './Container';
import { OpenInApp } from './OpenInApp';

/** Stores menu as <details> so it works without JavaScript; search is a plain GET form to /search. */
function StoresMenu() {
  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        المتاجر
        <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute start-0 top-full z-30 mt-1 w-64 rounded-panel border border-line bg-surface p-2 shadow-pop">
        <Link href="/stores" className="block rounded-card px-3 py-2 font-semibold hover:bg-sunken">
          كل المتاجر
        </Link>
        {STORE_TYPES.map(({ type, plural, description, icon: Icon, path }) => (
          <Link key={type} href={path} className="flex gap-3 rounded-card px-3 py-2 hover:bg-sunken">
            <Icon aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
            <span>
              <span className="block font-semibold">{plural}</span>
              <span className="block text-meta text-ink-3">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </details>
  );
}

export function SearchForm({ className, defaultValue }: { className?: string; defaultValue?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <label className="relative block">
        <span className="sr-only">ابحث عن منتج أو متجر</span>
        <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="ابحث عن منتج أو متجر..."
          className="h-11 w-full rounded-full border border-line-strong bg-surface ps-10 pe-4 text-ui placeholder:text-ink-3 focus:border-brand focus:outline-none"
        />
      </label>
    </form>
  );
}

const LINKS = [
  { href: '/offers', label: 'العروض' },
  { href: '/sell', label: 'ابدأ البيع' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/95 backdrop-blur">
      <Container className="relative flex h-16 items-center gap-4 lg:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="فاترينة، الرئيسية">
          <Image src="/brand/fatrina-mark.png" alt="" width={36} height={36} priority />
          <span className="font-sign text-section text-brand">فاترينة</span>
        </Link>

        <nav aria-label="الأقسام الرئيسية" className="hidden items-center gap-5 text-ui md:flex">
          <StoresMenu />
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="flex min-h-11 items-center font-semibold text-ink-2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <SearchForm className="hidden flex-1 md:block lg:ms-auto lg:max-w-md" />

        <OpenInApp path="" className="hidden min-h-10 text-ui md:inline-flex">
          حمّل التطبيق
        </OpenInApp>

        {/* Phones: one menu holding search, store types and links. */}
        <details className="group ms-auto md:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full hover:bg-sunken [&::-webkit-details-marker]:hidden" aria-label="القائمة">
            <Menu aria-hidden className="size-5" />
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-line bg-ground px-4 pb-6 pt-3 shadow-pop">
            <SearchForm />
            <p className="mt-5 text-meta font-semibold text-ink-3">المتاجر</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/stores" className="rounded-card border border-line bg-surface px-3 py-2.5 font-semibold">
                كل المتاجر
              </Link>
              {STORE_TYPES.map(({ type, plural, icon: Icon, path }) => (
                <Link key={type} href={path} className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5 font-semibold">
                  <Icon aria-hidden className="size-4 text-accent" />
                  {plural}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-11 items-center border-b border-line font-semibold">
                  {l.label}
                </Link>
              ))}
            </div>
            <OpenInApp path="" className="mt-5 w-full">
              حمّل التطبيق
            </OpenInApp>
          </div>
        </details>
      </Container>
    </header>
  );
}
