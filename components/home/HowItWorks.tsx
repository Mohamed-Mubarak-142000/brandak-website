import Image from 'next/image';

import { SectionHeader } from '@/components/SectionHeader';
import { num } from '@/lib/format';

const STEPS = [
  { art: 'onboarding-discover', title: 'اتفرّج واختار', body: 'دوّر على المنتج أو اتفرّج على فاترينات المتاجر هنا أو في التطبيق.' },
  { art: 'onboarding-shop', title: 'اطلب من التطبيق', body: 'اختار المقاس أو الكمية واكتب عنوانك، وهتعرف مصاريف الشحن قبل ما تأكّد.' },
  { art: 'onboarding-delivery', title: 'استلم وادفع كاش', body: 'المتجر بيجهّز طلبك ويبعته، وانت بتدفع للمندوب لما يوصلك.' },
];

export function HowItWorks() {
  return (
    <section>
      <SectionHeader title="الطلب بيمشي إزاي" body="تلات خطوات من الفرجة لحد ما الطلب يبقى في إيدك." href="/faq" linkLabel="أسئلة شائعة" />
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex items-center gap-4 rounded-panel border border-line bg-surface p-5 md:flex-col md:items-start md:p-6">
            <div className="relative shrink-0 rounded-card bg-sunken p-2 md:w-full md:p-4">
              <Image src={`/illustrations/${s.art}.png`} alt="" width={640} height={640} sizes="(min-width: 768px) 160px, 96px" className="mx-auto h-auto w-20 md:w-36" />
              <span className="absolute -top-2 start-2 grid size-8 place-items-center rounded-full bg-accent text-ui font-extrabold text-on-accent md:start-3 md:top-3">
                {num(i + 1)}
              </span>
            </div>
            <div>
              <h3 className="text-body font-extrabold">{s.title}</h3>
              <p className="mt-1 text-ui text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
