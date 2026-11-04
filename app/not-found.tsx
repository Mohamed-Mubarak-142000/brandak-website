import { BadgePercent, CircleHelp, House, Store } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { SearchForm } from '@/components/Header';

const LINKS = [
  { href: '/', label: 'الرئيسية', icon: House },
  { href: '/stores', label: 'المتاجر', icon: Store },
  { href: '/offers', label: 'العروض', icon: BadgePercent },
  { href: '/faq', label: 'الأسئلة الشائعة', icon: CircleHelp },
];

export default function NotFound() {
  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-window border border-line bg-surface px-5 py-10 text-center shadow-card sm:px-10 sm:py-14">
        <Image src="/illustrations/search.png" alt="" width={640} height={640} sizes="176px" className="h-auto w-36 sm:w-44" />
        <p className="mt-4 rounded-full bg-accent-soft px-3 py-1 text-ui font-bold text-accent">خطأ ٤٠٤</p>
        <h1 className="mt-3 text-page font-extrabold sm:text-display">الصفحة دي مش موجودة</h1>
        <p className="mt-2 max-w-md text-ink-2">ممكن اللينك يكون غلط، أو المنتج أو المتجر اتشال. دوّر على اللي كنت عايزه:</p>
        <SearchForm size="lg" className="mt-6 w-full max-w-lg" />
        <nav aria-label="روابط سريعة" className="mt-8 w-full">
          <ul className="flex flex-wrap justify-center gap-2">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-ui font-bold transition-colors hover:border-brand hover:text-accent"
                >
                  <Icon aria-hidden className="size-4 text-ink-3" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Container>
  );
}
