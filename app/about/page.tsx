import { Banknote, ChevronLeft, HeartHandshake, ShieldCheck, Sparkles, Store, UsersRound, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { SectionHeader } from '@/components/SectionHeader';
import { ABOUT } from '@/lib/content';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'فاترينة بتجمع براندات ومعارض ومخازن ومحلات مصرية متراجعة في مكان واحد، بأسعار واضحة وشحن لكل المحافظات ودفع كاش عند الاستلام.',
  alternates: { canonical: '/about' },
};

/** ABOUT.story is three paragraphs: the stores' side, the shoppers' side, and what we built. */
const STORY_PARTS: { label: string; icon: LucideIcon }[] = [
  { label: 'المتاجر', icon: Store },
  { label: 'العملاء', icon: UsersRound },
  { label: 'فاترينة', icon: Sparkles },
];

const VALUE_ICONS: LucideIcon[] = [ShieldCheck, Banknote, HeartHandshake, Sparkles];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Container className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-ui font-bold text-accent">{ABOUT.title}</p>
          <h1 className="mt-4 text-page font-extrabold sm:text-display">{ABOUT.lead}</h1>
          <p className="mt-4 max-w-[60ch] text-body text-ink-2 sm:text-section sm:leading-relaxed">{ABOUT.story[2]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/stores"
              className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover"
            >
              اتفرّج على المتاجر
            </Link>
            <Link
              href="/sell"
              className="inline-flex min-h-12 items-center rounded-full border border-line-strong bg-surface px-6 font-bold transition-colors hover:border-brand"
            >
              افتح متجرك
            </Link>
          </div>
        </div>
        <div className="rounded-window bg-sunken p-6 sm:p-8">
          <Image
            src="/illustrations/store.png"
            alt="واجهة متجر صغير بمنتجاته"
            width={640}
            height={640}
            sizes="(min-width: 1024px) 352px, 70vw"
            loading="eager"
            fetchPriority="high"
            className="mx-auto h-auto w-3/4 max-w-sm lg:w-full"
          />
        </div>
      </Container>

      {/* Story */}
      <section className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="ليه عملنا فاترينة" />
          <ol className="grid gap-4 md:grid-cols-3">
            {ABOUT.story.map((p, i) => {
              const part = STORY_PARTS[i] ?? STORY_PARTS[2];
              const Icon = part.icon;
              const last = i === ABOUT.story.length - 1;
              return (
                <li key={p} className={last ? 'rounded-panel border border-brand/40 bg-accent-soft p-6' : 'rounded-panel border border-line bg-surface p-6'}>
                  <div className="flex items-center gap-3">
                    <span className={last ? 'grid size-11 place-items-center rounded-card bg-accent text-on-accent' : 'grid size-11 place-items-center rounded-card bg-sunken text-ink-2'}>
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <h3 className="font-extrabold">{part.label}</h3>
                  </div>
                  <p className="mt-4 text-ink-2">{p}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-sunken">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="اللي بنمشي عليه" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT.values.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <li key={v.title} className="rounded-panel bg-surface p-6 shadow-card">
                  <span className="grid size-12 place-items-center rounded-card bg-accent-soft text-accent">
                    <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-section font-extrabold">{v.title}</h3>
                  <p className="mt-1 text-ink-2">{v.body}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Where next */}
      <Container className="grid gap-4 py-12 sm:grid-cols-2 sm:py-16">
        {[
          { href: '/stores', art: 'brands', title: 'اتفرّج على المتاجر', body: 'براندات ومعارض ومخازن ومحلات من كل مصر.' },
          { href: '/sell', art: 'onboarding-sell', title: 'عندك متجر؟', body: 'افتحه على فاترينة ببلاش وادفع عمولة بس لما تبيع.' },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-5 rounded-panel border border-line bg-surface p-5 transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card sm:p-6"
          >
            <Image src={`/illustrations/${c.art}.png`} alt="" width={640} height={640} sizes="96px" className="size-20 shrink-0 sm:size-24" />
            <div className="min-w-0 flex-1">
              <h2 className="text-section font-extrabold group-hover:text-accent">{c.title}</h2>
              <p className="mt-1 text-ink-2">{c.body}</p>
            </div>
            <ChevronLeft aria-hidden className="size-5 shrink-0 text-ink-3 transition-colors group-hover:text-accent" />
          </Link>
        ))}
      </Container>
    </>
  );
}
