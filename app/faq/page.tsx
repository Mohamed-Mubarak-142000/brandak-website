import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { FaqList } from '@/components/info/FaqList';
import { getTerms } from '@/lib/api';
import { FAQ, withRate } from '@/lib/content';
import { num } from '@/lib/format';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description: 'إجابات عن الطلب والدفع كاش عند الاستلام والشحن والاسترجاع والحساب، وعن فتح متجرك على فاترينة والعمولة.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const { commissionRate } = await getTerms();
  const groups = FAQ.map((g) => ({ ...g, items: g.items.map((i) => ({ q: i.q, a: withRate(i.a, commissionRate) })) }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) => g.items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } }))),
  };

  return (
    <Container className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <header className="max-w-2xl">
        <h1 className="text-page font-extrabold sm:text-display">الأسئلة الشائعة</h1>
        <p className="mt-2 text-body text-ink-2 sm:text-section sm:leading-relaxed">كل اللي محتاج تعرفه عن الطلب والدفع والشحن، وعن البيع على فاترينة.</p>
      </header>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="أقسام الأسئلة" className="lg:sticky lg:top-48 lg:self-start">
          <ul className="rail -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {groups.map((g) => (
              <li key={g.id} className="shrink-0">
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-ui font-semibold text-ink-2 transition-colors hover:border-brand hover:text-ink lg:flex lg:w-full lg:justify-between lg:rounded-card lg:border-transparent lg:px-3 lg:hover:bg-sunken"
                >
                  {g.title}
                  <span className="rounded-full bg-sunken px-2 text-meta text-ink-3 lg:bg-transparent">{num(g.items.length)}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden rounded-panel bg-sunken p-4 lg:block">
            <p className="text-ui font-bold">مش لاقي إجابتك؟</p>
            <Link href="/contact" className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-ui font-bold text-accent underline-offset-4 hover:underline">
              <Mail aria-hidden className="size-4" />
              كلّمنا
            </Link>
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-12">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-36 sm:scroll-mt-48">
              <h2 id={`${g.id}-title`} className="mb-4 text-section font-extrabold sm:text-page">
                {g.title}
              </h2>
              <FaqList items={g.items} />
              {g.id === 'sellers' ? (
                <Link href="/sell" className="mt-4 inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                  كل التفاصيل عن البيع على فاترينة
                </Link>
              ) : null}
            </section>
          ))}

          <aside className="flex flex-col items-start gap-4 rounded-panel border border-line bg-sunken p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-section font-extrabold">مش لاقي إجابتك؟</h2>
              <p className="mt-1 text-ink-2">ابعتلنا وهنرد عليك في أقرب وقت.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-accent px-5 font-bold text-on-accent transition-colors hover:bg-accent-hover"
            >
              تواصل معانا
            </Link>
          </aside>
        </div>
      </div>
    </Container>
  );
}
