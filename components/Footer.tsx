import Image from 'next/image';
import Link from 'next/link';

import { PLAY_URL, SITE_URL, SUPPORT_EMAIL } from '@/lib/links';
import { STORE_TYPES } from '@/lib/store-types';

import { Container } from './Container';
import { QrCode } from './QrCode';

const GROUPS = [
  {
    title: 'المتاجر',
    links: [{ href: '/stores', label: 'كل المتاجر' }, ...STORE_TYPES.map((t) => ({ href: t.path, label: t.plural })), { href: '/offers', label: 'العروض' }],
  },
  {
    title: 'فاترينة',
    links: [
      { href: '/about', label: 'من نحن' },
      { href: '/sell', label: 'ابدأ البيع على فاترينة' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
      { href: '/contact', label: 'تواصل معانا' },
    ],
  },
  {
    title: 'القانونية',
    links: [
      { href: '/terms', label: 'الشروط والأحكام' },
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/delete-account', label: 'حذف الحساب' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sunken">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Image src="/brand/fatrina-logo.png" alt="فاترينة" width={96} height={96} className="h-auto w-20" />
          <p className="mt-3 max-w-xs text-ui text-ink-2">براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. والدفع كاش لما الطلب يوصلك.</p>
          <div className="mt-5 flex items-center gap-4">
            <div className="hidden sm:block">
              <QrCode value={`${SITE_URL}/download`} size={96} label="امسح الكود عشان تحمّل التطبيق" />
            </div>
            <a href={PLAY_URL} className="text-ui font-bold text-accent underline-offset-4 hover:underline">
              حمّل التطبيق من Google Play
            </a>
          </div>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h2 className="text-ui font-extrabold">{g.title}</h2>
            <ul className="mt-3 space-y-1">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-ui text-ink-2 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="flex flex-wrap justify-between gap-2 border-t border-line py-5 text-meta text-ink-3">
        <span>© فاترينة</span>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-accent">
          {SUPPORT_EMAIL}
        </a>
      </Container>
    </footer>
  );
}
