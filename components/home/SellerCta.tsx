import Image from 'next/image';
import Link from 'next/link';

import { percent } from '@/lib/format';

export function SellerCta({ commissionRate }: { commissionRate: number }) {
  return (
    <section className="grid items-center gap-6 rounded-window border border-line bg-surface p-6 sm:grid-cols-[1fr_auto] sm:p-10">
      <div>
        <h2 className="font-sign text-page sm:text-display">عندك براند أو معرض أو مخزن أو محل؟</h2>
        <p className="mt-3 max-w-xl text-body text-ink-2">
          افتح فاترينتك على فاترينة ببلاش، واعرض منتجاتك لعملاء من كل المحافظات. بنحاسبك بـ {percent(commissionRate)} بس على الطلبات اللي اتسلّمت فعلًا.
        </p>
        <Link
          href="/sell"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover"
        >
          ابدأ البيع على فاترينة
        </Link>
      </div>
      <Image src="/illustrations/onboarding-sell.png" alt="" width={260} height={260} className="mx-auto h-auto w-44 sm:w-60" />
    </section>
  );
}
