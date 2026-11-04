import { Bell, BellRing, RotateCcw, TrendingDown } from 'lucide-react';
import Image from 'next/image';

import { OpenInApp } from './OpenInApp';

const PERKS = [
  { icon: BellRing, title: 'إشعار فوري بحالة طلبك', body: 'من التأكيد للشحن لحد ما يوصل بابك، يوصلك إشعار في كل خطوة.' },
  { icon: RotateCcw, title: 'مرتجعات وشكاوى وتقييمات', body: 'ترجّع منتج أو تفتح شكوى أو تقيّم اللي استلمته من صفحة الطلب.' },
  { icon: TrendingDown, title: 'تنبيه لما السعر ينزل', body: 'وتنبيه لما المقاس اللي عايزه يرجع.' },
  { icon: Bell, title: 'تابع متاجرك', body: 'يوصلك الجديد والعروض أول بأول.' },
];

/**
 * What the app adds on top of ordering here — the reason to install. Full on the home page;
 * compact under product and store pages.
 */
export function AppPerks({ compact, path = '' }: { compact?: boolean; path?: string }) {
  if (compact) {
    return (
      <section className="rounded-panel border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-body font-extrabold">حمّل التطبيق عشان تتابع أسرع</h2>
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
        <h2 className="text-page font-extrabold sm:text-display">حمّل التطبيق عشان تتابع أسرع</h2>
        <p className="mt-2 max-w-xl text-ink-2">تقدر تطلب هنا على الموقع أو من التطبيق بنفس الحساب. والتطبيق بيزوّدك إشعارات فورية وتنبيهات للأسعار، ومنه ترجّع أو تشتكي أو تقيّم.</p>
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
