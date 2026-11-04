import { BadgePercent, Bell, Coins, PackageCheck } from 'lucide-react';

import { OpenInApp } from './OpenInApp';

const PERKS = [
  { icon: PackageCheck, title: 'تتبّع طلبك خطوة بخطوة', body: 'من التأكيد لحد ما يوصل بابك، مع إشعار في كل خطوة.' },
  { icon: Coins, title: 'نقاط على كل طلب', body: 'كل ١٠ ج.م بنقطة، وتصرفها خصم في أي متجر.' },
  { icon: BadgePercent, title: 'كوبونات وعروض التطبيق', body: 'أكواد خصم من المتاجر وعروض المواسم.' },
  { icon: Bell, title: 'تابع متاجرك', body: 'يوصلك الجديد والعروض، وتنبيه لما السعر ينزل.' },
];

/**
 * What only the app gives — the reason to install. Shown on the home page and, compact, under
 * product and store pages.
 */
export function AppPerks({ compact, path = '' }: { compact?: boolean; path?: string }) {
  return (
    <section className={compact ? 'rounded-panel bg-sunken p-5' : 'rounded-window bg-sunken p-6 sm:p-10'}>
      <h2 className={compact ? 'text-body font-extrabold' : 'font-sign text-page sm:text-display'}>الطلب من التطبيق بيكسّبك أكتر</h2>
      <ul className={compact ? 'mt-4 grid gap-3 sm:grid-cols-2' : 'mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'}>
        {PERKS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <h3 className="text-ui font-bold">{title}</h3>
              {!compact ? <p className="mt-0.5 text-ui text-ink-2">{body}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      <OpenInApp path={path} className="mt-6">
        حمّل فاترينة ببلاش
      </OpenInApp>
    </section>
  );
}
