import Link from 'next/link';

import { Container } from '@/components/Container';
import type { LegalDoc } from '@/lib/content';
import { date } from '@/lib/format';

const LEGAL_PAGES = [
  { href: '/terms', label: 'الشروط والأحكام' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/delete-account', label: 'حذف الحساب' },
];

/**
 * Long-form legal text: one readable column (~70 characters a line), numbered sections, and links
 * between the three legal pages. `fill` swaps placeholders like `{rate}` in the copy.
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
  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="الصفحات القانونية" className="mb-8 flex flex-wrap gap-2">
        {LEGAL_PAGES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            aria-current={p.href === current ? 'page' : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-ui font-semibold text-ink-2 hover:border-brand aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-ground"
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <article className="max-w-[70ch]">
        <h1 className="font-sign text-page sm:text-display">{doc.title}</h1>
        <p className="mt-2 text-ui text-ink-3">
          آخر تحديث: <time dateTime={updated}>{date(updated)}</time>
        </p>
        <p className="mt-6 text-body text-ink-2 sm:text-section sm:leading-relaxed">{fill(doc.intro)}</p>

        {children}

        {doc.sections.map((s) => (
          <section key={s.title} className="mt-10">
            <h2 className="text-section font-extrabold">{s.title}</h2>
            {s.body ? <p className="mt-3 text-ink-2">{fill(s.body)}</p> : null}
            {s.points ? (
              <ul className="mt-3 space-y-2 ps-5 text-ink-2 marker:text-brand list-disc">
                {s.points.map((p) => (
                  <li key={p} className="ps-1">
                    {fill(p)}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </Container>
  );
}
