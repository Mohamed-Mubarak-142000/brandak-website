import Image from 'next/image';

import { num } from '@/lib/format';

const STEPS = [
  { art: 'onboarding-discover', title: 'اكتشف', body: 'دوّر على المنتج أو اتفرّج على فاترينات المتاجر هنا أو في التطبيق.' },
  { art: 'onboarding-shop', title: 'اطلب من التطبيق', body: 'اختار المقاس أو الكمية واكتب عنوانك، وهتعرف مصاريف الشحن قبل ما تأكّد.' },
  { art: 'onboarding-delivery', title: 'استلم وادفع كاش', body: 'المتجر بيجهّز طلبك ويبعته، وانت بتدفع للمندوب لما يوصلك.' },
];

export function HowItWorks() {
  return (
    <section>
      <h2 className="text-section font-extrabold sm:text-page">الطلب بيمشي إزاي</h2>
      <ol className="mt-6 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 sm:flex-col">
            <Image src={`/illustrations/${s.art}.png`} alt="" width={160} height={160} className="h-auto w-24 shrink-0 sm:w-32" />
            <div>
              <h3 className="flex items-center gap-2 text-body font-bold">
                <span className="grid size-7 place-items-center rounded-full bg-accent text-meta font-extrabold text-on-accent">{num(i + 1)}</span>
                {s.title}
              </h3>
              <p className="mt-1 text-ui text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
