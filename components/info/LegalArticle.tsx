import { CalendarCheck, ChevronDown, ChevronLeft, FileText, ShieldCheck, UserRoundX } from 'lucide-react';
import Link from 'next/link';

import { Container } from '@/components/Container';
import type { LegalDoc } from '@/lib/content';
import { date } from '@/lib/format';

const LEGAL_PAGES = [
  { href: '/terms', label: 'الشروط والأحكام', body: 'قواعد الشراء والبيع على فاترينة.', icon: FileText },
  { href: '/privacy', label: 'سياسة الخصوصية', body: 'بنجمع إيه من بياناتك وإزاي بنحميها.', icon: ShieldCheck },
  { href: '/delete-account', label: 'حذف الحساب', body: 'إزاي تمسح حسابك وبياناتك.', icon: UserRoundX },
];

const sectionId = (i: number) => `section-${i + 1}`;

/** "1. فاترينة بتعمل إيه" → "فاترينة بتعمل إيه" for the contents list (numbers come from the <ol>). */
const tocLabel = (title: string) => title.replace(/^\s*\d+[.)]\s*/, '');

function Contents({ doc }: { doc: LegalDoc }) {
  return (
    <ol className="space-y-0.5 text-ui">
      {doc.sections.map((s, i) => (
        <li key={s.title}>
          <a
            href={`#${sectionId(i)}`}
            className="flex min-h-11 items-center gap-2.5 rounded-card px-3 py-1.5 text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
          >
            <span aria-hidden className="w-5 shrink-0 text-meta font-bold text-ink-3 tabular-nums">
              {(i + 1).toLocaleString('ar-EG')}
            </span>
            {tocLabel(s.title)}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Long-form legal text: a sticky contents list on large screens (a collapsible one on phones), one
 * readable column (~70 characters a line) with anchored sections, and links between the three
 * legal pages. `fill` swaps placeholders like `{rate}` in the copy.
 */
export function LegalArticle({
  doc,
  current,
  updated,
  fill = (s) => s,
  children,
}: {
  doc: LegalDoc;
  current: string;
  updated: string;
  fill?: (s: string) => string;
  children?: React.ReactNode;
}) {
  const others = LEGAL_PAGES.filter((p) => p.href !== current);

  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="الصفحات القانونية" className="rail -mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="inline-flex gap-1 rounded-full bg-sunken p-1">
          {LEGAL_PAGES.map((p) => (
            <li key={p.href} className="shrink-0">
              <Link
                href={p.href}
                aria-current={p.href === current ? 'page' : undefined}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-ui font-semibold text-ink-2 transition-colors hover:text-ink aria-[current=page]:bg-surface aria-[current=page]:text-ink aria-[current=page]:shadow-card"
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:sticky lg:top-48 lg:block lg:self-start">
          <p className="mb-2 px-3 text-ui font-extrabold">في الصفحة دي</p>
          <nav aria-label="محتويات الصفحة">
            <Contents doc={doc} />
          </nav>
        </aside>

        <article className="min-w-0 max-w-[70ch]">
          <header className="border-b border-line pb-8">
            <h1 className="text-page font-extrabold sm:text-display">{doc.title}</h1>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sunken px-3 py-1 text-ui text-ink-2">
              <CalendarCheck aria-hidden className="size-4 text-accent" />
              آخر تحديث: <time dateTime={updated}>{date(updated)}</time>
            </p>
            <p className="mt-6 text-body text-ink-2 sm:text-section sm:leading-relaxed">{fill(doc.intro)}</p>
            {children}
          </header>

          <details className="group mt-6 rounded-panel border border-line lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-bold [&::-webkit-details-marker]:hidden">
              في الصفحة دي
              <ChevronDown aria-hidden className="size-5 text-ink-3 transition-transform group-open:rotate-180" />
            </summary>
            <nav aria-label="محتويات الصفحة" className="px-1 pb-2">
              <Contents doc={doc} />
            </nav>
          </details>

          {doc.sections.map((s, i) => (
            <section key={s.title} id={sectionId(i)} aria-labelledby={`${sectionId(i)}-title`} className="mt-10 scroll-mt-36 sm:scroll-mt-48">
              <h2 id={`${sectionId(i)}-title`} className="text-section font-extrabold">
                {s.title}
              </h2>
              {s.body ? <p className="mt-3 text-ink-2">{fill(s.body)}</p> : null}
              {s.points ? (
                <ul className="mt-3 list-disc space-y-2 ps-5 text-ink-2 marker:text-brand">
                  {s.points.map((p) => (
                    <li key={p} className="ps-1">
                      {fill(p)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <footer className="mt-14 border-t border-line pt-8">
            <h2 className="text-body font-extrabold">صفحات تانية ممكن تهمك</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {others.map(({ href, label, body, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex h-full items-center gap-3 rounded-panel border border-line p-4 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-card bg-accent-soft text-accent">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold group-hover:text-accent">{label}</span>
                      <span className="block text-meta text-ink-2">{body}</span>
                    </span>
                    <ChevronLeft aria-hidden className="size-4 shrink-0 text-ink-3" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-ui text-ink-2">
              عندك سؤال عن الصفحة دي؟{' '}
              <Link href="/contact" className="font-bold text-accent underline-offset-4 hover:underline">
                تواصل معانا
              </Link>
            </p>
          </footer>
        </article>
      </div>
    </Container>
  );
}
