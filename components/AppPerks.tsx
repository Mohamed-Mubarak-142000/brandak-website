import { BadgePercent, Bell, Coins, PackageCheck } from 'lucide-react';
import Image from 'next/image';

import { OpenInApp } from './OpenInApp';

const PERKS = [
  { icon: PackageCheck, title: 'تتبّع طلبك خطوة بخطوة', body: 'من التأكيد لحد ما يوصل بابك، مع إشعار في كل خطوة.' },
  { icon: Coins, title: 'نقاط على كل طلب', body: 'كل ١٠ ج.م بنقطة، وتصرفها خصم في أي متجر.' },
  { icon: BadgePercent, title: 'كوبونات وعروض التطبيق', body: 'أكواد خصم من المتاجر وعروض المواسم.' },
  { icon: Bell, title: 'تابع متاجرك', body: 'يوصلك الجديد والعروض، وتنبيه لما السعر ينزل.' },
];

/**
 * What only the app gives — the reason to install. Full on the home page; compact under product
 * and store pages.
 */
export function AppPerks({ compact, path = '' }: { compact?: boolean; path?: string }) {
  if (compact) {
    return (
      <section className="rounded-panel border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-body font-extrabold">الطلب من التطبيق بيكسّبك أكتر</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="text-ui font-bold">{title}</span>
            </li>
          ))}
        </ul>
        <OpenInApp path={path} className="mt-5">
          حمّل فاترينة ببلاش
        </OpenInApp>
      </section>
    );
  }

  return (
    <section className="grid items-center gap-8 overflow-hidden rounded-window bg-sunken p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="text-page font-extrabold sm:text-display">الطلب من التطبيق بيكسّبك أكتر</h2>
        <p className="mt-2 max-w-xl text-ink-2">التصفح هنا ببلاش ومن غير حساب. ولما تحب تطلب، التطبيق بيديك مزايا مش موجودة في أي مكان تاني.</p>
        <ul className="mt-7 grid gap-5 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-card bg-surface text-accent shadow-card">
                <Icon aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="text-ui font-bold sm:text-body">{title}</h3>
                <p className="mt-0.5 text-ui text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <OpenInApp path={path} className="mt-8">
          حمّل فاترينة ببلاش
        </OpenInApp>
      </div>
      <Image src="/screens/2-home.png" alt="الشاشة الرئيسية في تطبيق فاترينة" width={600} height={1067} className="mx-auto hidden h-auto w-56 rounded-[2rem] border-[6px] border-ink shadow-pop lg:block" />
    </section>
  );
}
