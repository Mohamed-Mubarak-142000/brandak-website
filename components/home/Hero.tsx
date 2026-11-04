import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Awning } from '@/components/Awning';
import { Container } from '@/components/Container';
import { OpenInApp } from '@/components/OpenInApp';
import { price } from '@/lib/format';
import type { ProductCard } from '@/lib/types';

/**
 * The shop window from the logo: an arch with the awning across it and real products on two
 * shelves. With no products it shows the "discover" illustration instead of empty shelves.
 */
function Vitrine({ products }: { products: ProductCard[] }) {
  const items = products.filter((p) => p.imageUrl).slice(0, 4);
  const shelves = items.length ? [items.slice(0, 2), items.slice(2, 4)].filter((s) => s.length) : [];

  return (
    <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[23rem]">
      <div className="overflow-hidden rounded-t-full border-[6px] border-b-0 border-brand bg-surface">
        {/* The arch's glass: exactly half the width tall, so the awning sits where the curve ends. */}
        <div className="grid aspect-[2/1] place-items-end justify-center bg-accent-soft pb-3">
          <Image src="/brand/fatrina-mark.png" alt="" width={72} height={72} className="size-14 sm:size-16" />
        </div>
        <Awning tone="brand" className="h-6" />
        {shelves.length ? (
          <div className="space-y-5 px-4 pb-5 pt-5 sm:px-5">
            {shelves.map((shelf, i) => (
              <div key={i} className="border-b-[6px] border-line-strong pb-2">
                <ul className="grid grid-cols-2 gap-3">
                  {shelf.map((p, j) => (
                    <li key={p.id}>
                      <Link href={`/product/${p.id}`} className="group block">
                        <span className="relative block aspect-square overflow-hidden rounded-card bg-sunken">
                          <Image
                            src={p.imageUrl!}
                            alt={p.title}
                            fill
                            priority={i === 0 && j < 2}
                            sizes="(min-width: 640px) 170px, 140px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        </span>
                        <span className="mt-1.5 inline-block rounded-full bg-sunken px-2 text-meta font-bold text-ink group-hover:text-accent">{price(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 pb-6 pt-4">
            <Image src="/illustrations/onboarding-discover.png" alt="" width={320} height={320} priority className="mx-auto h-auto w-full max-w-60" />
          </div>
        )}
      </div>
      {/* The sill */}
      <div className="-mx-2 h-3 rounded-card bg-brand" />
    </div>
  );
}

export function Hero({ products }: { products: ProductCard[] }) {
  return (
    <section className="pb-12 pt-8 sm:pb-16 sm:pt-14">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <h1 className="font-sign text-display leading-tight sm:text-hero">كل فاترينات مصر في جيبك</h1>
          <p className="mt-4 max-w-xl text-body text-ink-2 sm:text-section sm:leading-relaxed">
            براندات ومعارض ومخازن ومحلات، توصيل لكل المحافظات، والدفع كاش عند الاستلام.
          </p>

          <form action="/search" role="search" className="mt-7 flex max-w-xl gap-2 rounded-full border border-line-strong bg-surface p-1.5 focus-within:border-brand">
            <label className="relative flex-1">
              <span className="sr-only">ابحث عن منتج أو متجر</span>
              <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
              <input
                name="q"
                type="search"
                placeholder="بتدوّر على إيه؟"
                className="h-12 w-full rounded-full bg-transparent ps-11 pe-2 text-body placeholder:text-ink-3 focus:outline-none"
              />
            </label>
            <button type="submit" className="min-h-12 shrink-0 rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover">
              ابحث
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <OpenInApp path="" variant="secondary">
              حمّل التطبيق
            </OpenInApp>
            <Link href="/stores" className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
              تصفّح المتاجر
            </Link>
          </div>
        </div>

        <Vitrine products={products} />
      </Container>
    </section>
  );
}
