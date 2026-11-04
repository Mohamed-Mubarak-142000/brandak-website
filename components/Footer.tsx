import { Banknote, Mail, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PLAY_URL, SUPPORT_EMAIL } from '@/lib/links';
import { STORE_TYPES } from '@/lib/store-types';
import type { Category } from '@/lib/types';

import { Container } from './Container';
import { QrCode } from './QrCode';

const TRUST = [
  { icon: Banknote, title: 'الدفع عند الاستلام', body: 'مفيش دفع مقدّم على أي طلب.' },
  { icon: Truck, title: 'توصيل لكل المحافظات', body: 'مصاريف الشحن قدامك قبل ما تطلب.' },
  { icon: ShieldCheck, title: 'متاجر متراجعة', body: 'كل متجر بيتراجع قبل ما يظهر.' },
];

function LinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-ui font-extrabold">{title}</h2>
      <ul className="mt-3 space-y-0.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-9 items-center text-ui text-ink-2 transition-colors hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ categories }: { categories: Category[] }) {
  const sections = categories
    .filter((c) => c.isActive !== false && (c.level ?? (c.parentId ? 1 : 0)) === 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 7)
    .map((c) => ({ href: `/category/${c._id}`, label: c.nameAr }));

  return (
    <footer className="mt-24 border-t border-line bg-sunken">
      {/* Trust row */}
      <Container className="grid gap-6 border-b border-line py-8 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-accent shadow-card">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-ui text-ink-2">{body}</p>
            </div>
          </div>
        ))}
      </Container>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/brand/fatrina-mark.png" alt="" width={40} height={40} />
            <span className="font-sign text-page text-brand">فاترينة</span>
          </Link>
          <p className="mt-3 max-w-xs text-ui text-ink-2">براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. اطلب هنا على الموقع أو من التطبيق.</p>
          <div className="mt-5 flex items-center gap-4 rounded-panel bg-surface p-3 shadow-card">
            <QrCode value={PLAY_URL} size={84} label="امسح الكود عشان تحمّل التطبيق من Google Play" />
            <div>
              <p className="text-ui font-bold">حمّل التطبيق</p>
              <p className="text-meta text-ink-3">امسح الكود بكاميرا موبايلك</p>
              <a href={PLAY_URL} className="mt-2 inline-flex min-h-9 items-center rounded-full bg-ink px-4 text-meta font-bold text-surface transition-colors hover:bg-accent">
                Google Play
              </a>
            </div>
          </div>
        </div>

        <LinkGroup title="المتاجر" links={[...STORE_TYPES.map((t) => ({ href: t.path, label: t.plural })), { href: '/stores', label: 'كل المتاجر' }, { href: '/offers', label: 'العروض' }]} />
        {sections.length ? <LinkGroup title="الأقسام" links={sections} /> : null}
        <LinkGroup
          title="فاترينة"
          links={[
            { href: '/about', label: 'من نحن' },
            { href: '/sell', label: 'ابدأ البيع على فاترينة' },
            { href: '/download', label: 'حمّل التطبيق' },
            { href: '/faq', label: 'الأسئلة الشائعة' },
            { href: '/contact', label: 'تواصل معانا' },
          ]}
        />
        <LinkGroup
          title="القانونية"
          links={[
            { href: '/terms', label: 'الشروط والأحكام' },
            { href: '/privacy', label: 'سياسة الخصوصية' },
            { href: '/delete-account', label: 'حذف الحساب' },
          ]}
        />
      </Container>

      <div className="border-t border-line bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-meta text-ink-3">
          <span>© فاترينة. كل الحقوق محفوظة.</span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-9 items-center gap-1.5 hover:text-accent">
            <Mail aria-hidden className="size-3.5" />
            {SUPPORT_EMAIL}
          </a>
        </Container>
      </div>
    </footer>
  );
}
