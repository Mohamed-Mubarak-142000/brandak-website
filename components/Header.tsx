import { Banknote, Percent, Search, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { STORE_TYPES } from '@/lib/store-types';
import type { Category } from '@/lib/types';

import { Container } from './Container';
import { HeaderShell, NavLink } from './header/HeaderParts';
import { MobileMenu } from './header/MobileMenu';
import { ShopMenu, type MenuSection } from './header/ShopMenu';
import { OpenInApp } from './OpenInApp';

export function SearchForm({ className, defaultValue, size = 'md' }: { className?: string; defaultValue?: string; size?: 'md' | 'lg' }) {
  return (
    <form action="/search" role="search" className={className}>
      <label className="relative block">
        <span className="sr-only">ابحث عن منتج أو متجر</span>
        <Search aria-hidden className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="ابحث عن منتج، متجر، أو قسم..."
          className={
            size === 'lg'
              ? 'h-14 w-full rounded-full border border-line-strong bg-surface ps-12 pe-5 text-body shadow-card placeholder:text-ink-3 focus:border-brand focus:outline-none'
              : 'h-11 w-full rounded-full border border-transparent bg-sunken ps-12 pe-4 text-ui placeholder:text-ink-3 transition-colors focus:border-brand focus:bg-surface focus:outline-none'
          }
        />
      </label>
    </form>
  );
}

const TRUST = [
  { icon: Banknote, text: 'الدفع كاش عند الاستلام' },
  { icon: Truck, text: 'توصيل لكل المحافظات' },
  { icon: ShieldCheck, text: 'متاجر متراجعة' },
];

/** Top-level sections for the menus, in the API's order. */
const menuSections = (categories: Category[]): MenuSection[] =>
  categories
    .filter((c) => c.isActive !== false && (c.level ?? (c.parentId ? 1 : 0)) === 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ id: c._id, name: c.nameAr, icon: c.icon }));

export function Header({ categories }: { categories: Category[] }) {
  const sections = menuSections(categories);
  return (
    <HeaderShell>
      {/* Thin trust strip */}
      <div className="hidden bg-sunken text-meta text-ink-2 sm:block">
        <Container className="flex h-9 items-center justify-between gap-4">
          <ul className="flex items-center gap-6">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon aria-hidden className="size-3.5 text-brand" />
                {text}
              </li>
            ))}
          </ul>
          <Link href="/sell" className="font-semibold text-ink hover:text-accent">
            عندك متجر؟ ابدأ البيع على فاترينة
          </Link>
        </Container>
      </div>

      <Container className="flex h-16 items-center gap-3 md:h-[4.5rem] md:gap-6">
        <MobileMenu sections={sections} />
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="فاترينة، الرئيسية">
          <Image src="/brand/fatrina-mark.png" alt="" width={40} height={40} priority className="size-9 md:size-10" />
          <span className="font-sign text-section text-brand md:text-page">فاترينة</span>
        </Link>

        <SearchForm className="hidden flex-1 md:block lg:mx-6" />

        <OpenInApp path="" className="ms-auto min-h-10 px-4 text-ui md:ms-0">
          <Smartphone aria-hidden className="size-4" />
          <span className="hidden sm:inline">حمّل التطبيق</span>
          <span className="sm:hidden">التطبيق</span>
        </OpenInApp>
      </Container>

      {/* Phones: search gets its own row */}
      <Container className="pb-3 md:hidden">
        <SearchForm />
      </Container>

      <nav aria-label="التسوّق" className="hidden border-t border-line md:block">
        <Container className="flex h-14 items-center gap-6">
          <ShopMenu sections={sections} />
          <ul className="flex items-center gap-5">
            {STORE_TYPES.map((t) => (
              <li key={t.type}>
                <NavLink href={t.path}>{t.plural}</NavLink>
              </li>
            ))}
            <li>
              <NavLink href="/offers" className="text-accent hover:text-accent-hover">
                <Percent aria-hidden className="size-4" />
                العروض
              </NavLink>
            </li>
          </ul>
          <div className="ms-auto flex items-center gap-5">
            <NavLink href="/stores">كل المتاجر</NavLink>
            <NavLink href="/sell">ابدأ البيع</NavLink>
          </div>
        </Container>
      </nav>
    </HeaderShell>
  );
}
