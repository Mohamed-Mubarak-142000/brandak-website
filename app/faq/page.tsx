import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { FaqList } from '@/components/info/FaqList';
import { getTerms } from '@/lib/api';
import { FAQ, withRate } from '@/lib/content';

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

      <h1 className="font-sign text-page sm:text-display">الأسئلة الشائعة</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        مش لاقي إجابتك؟{' '}
        <Link href="/contact" className="font-bold text-accent underline-offset-4 hover:underline">
          كلّمنا
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="أقسام الأسئلة" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-ui font-semibold text-ink-2 hover:border-brand hover:text-ink lg:w-full lg:rounded-card lg:border-transparent lg:px-3 lg:hover:bg-sunken"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-12">
          {groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-24">
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
        </div>
      </div>
    </Container>
  );
}
