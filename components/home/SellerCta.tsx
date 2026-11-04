import Image from 'next/image';
import Link from 'next/link';

import { percent } from '@/lib/format';
import { STORE_TYPES } from '@/lib/store-types';

/** The invitation to sellers of all four kinds. */
export function SellerCta({ commissionRate }: { commissionRate: number }) {
  return (
    <section className="grid items-center gap-8 overflow-hidden rounded-window border border-line bg-sunken p-6 sm:p-10 md:grid-cols-[1fr_auto] lg:px-14">
      <div>
        <h2 className="text-page font-extrabold sm:text-display">عندك متجر؟ افتحه على فاترينة ببلاش</h2>
        <p className="mt-3 max-w-xl text-body text-ink-2">
          اعرض منتجاتك لعملاء من كل المحافظات، وبنحاسبك بـ {percent(commissionRate)} بس على الطلبات اللي اتسلّمت فعلًا.
        </p>
        <ul aria-label="أنواع المتاجر اللي تقدر تفتحها" className="mt-5 flex flex-wrap gap-2">
          {STORE_TYPES.map(({ type, label, icon: Icon }) => (
            <li key={type} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-ui font-semibold">
              <Icon aria-hidden className="size-4 text-brand" />
              {label}
            </li>
          ))}
        </ul>
        <Link
          href="/sell"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          ابدأ البيع على فاترينة
        </Link>
      </div>
      <Image src="/illustrations/onboarding-sell.png" alt="" width={640} height={640} sizes="(min-width: 768px) 280px, 200px" className="mx-auto h-auto w-48 md:w-64 lg:w-72" />
    </section>
  );
}
