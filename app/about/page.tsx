import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { ABOUT } from '@/lib/content';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'فاترينة بتجمع براندات ومعارض ومخازن ومحلات مصرية متراجعة في مكان واحد، بأسعار واضحة وشحن لكل المحافظات ودفع كاش عند الاستلام.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <Container className="grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div>
          <p className="font-bold text-ink-3">{ABOUT.title}</p>
          <h1 className="mt-2 font-sign text-display sm:text-hero">{ABOUT.lead}</h1>
          <div className="mt-6 max-w-[65ch] space-y-4 text-body text-ink-2 sm:text-section sm:leading-relaxed">
            {ABOUT.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <Image
          src="/illustrations/store.png"
          alt="واجهة متجر صغير بمنتجاته"
          width={1254}
          height={1254}
          sizes="(min-width: 1024px) 384px, 70vw"
          loading="eager"
          className="mx-auto h-auto w-3/4 max-w-sm lg:w-full"
        />
      </Container>

      <section className="border-y border-line bg-sunken">
        <Container className="grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <Image src="/illustrations/trust.png" alt="" width={1254} height={1254} sizes="(min-width: 1024px) 320px, 50vw" className="mx-auto hidden h-auto w-full max-w-xs lg:block" />
          <div>
            <h2 className="text-section font-extrabold sm:text-page">اللي بنمشي عليه</h2>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              {ABOUT.values.map((v) => (
                <div key={v.title} className="border-s-4 border-brand ps-4">
                  <dt className="text-body font-extrabold">{v.title}</dt>
                  <dd className="mt-1 text-ink-2">{v.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <Container className="grid gap-4 py-12 sm:grid-cols-2 sm:py-16">
        <Link href="/stores" className="group rounded-panel border border-line bg-surface p-6 hover:border-brand">
          <h2 className="text-section font-extrabold group-hover:text-accent">اتفرّج على المتاجر</h2>
          <p className="mt-1 text-ink-2">براندات ومعارض ومخازن ومحلات من كل مصر.</p>
        </Link>
        <Link href="/sell" className="group rounded-panel border border-line bg-surface p-6 hover:border-brand">
          <h2 className="text-section font-extrabold group-hover:text-accent">عندك متجر؟</h2>
          <p className="mt-1 text-ink-2">افتحه على فاترينة ببلاش وادفع عمولة بس لما تبيع.</p>
        </Link>
      </Container>
    </>
  );
}
