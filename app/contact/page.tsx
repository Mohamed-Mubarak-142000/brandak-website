import { Check, CircleHelp, Mail, PackageSearch, Store, UserRoundX } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { OpenInApp } from '@/components/OpenInApp';
import { appPath, SUPPORT_EMAIL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'تواصل معانا',
  description: 'كلّم فريق فاترينة على الإيميل: مشكلة في طلب، حسابك، أو سؤال عن فتح متجر.',
  alternates: { canonical: '/contact' },
};

const INCLUDE = [
  'رقم الطلب، لو سؤالك عن طلب.',
  'الإيميل اللي مسجّل بيه في فاترينة.',
  'اسم المتجر أو المنتج اللي بتسأل عنه.',
  'وصف قصير للي حصل، وصورة للشاشة أو للمنتج لو تقدر.',
];

const card = 'flex flex-col rounded-panel border border-line bg-surface p-6 transition-shadow hover:shadow-card';
const tile = 'grid size-12 place-items-center rounded-card bg-accent-soft text-accent';

export default function ContactPage() {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="text-page font-extrabold sm:text-display">تواصل معانا</h1>
        <p className="mt-2 text-body text-ink-2 sm:text-section sm:leading-relaxed">اختار اللي يناسب سؤالك، وهنرد عليك في أقرب وقت.</p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className={card}>
          <span className={tile}>
            <Mail aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 text-section font-extrabold">ابعتلنا إيميل</h2>
          <p className="mt-1 text-ink-2">لأي سؤال عن حسابك أو عن فاترينة.</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            dir="ltr"
            className="mt-auto inline-flex min-h-11 max-w-full items-center pt-4 text-ui font-bold break-all text-accent underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </section>

        <section className={card}>
          <span className={tile}>
            <PackageSearch aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 text-section font-extrabold">مشكلة في طلب؟</h2>
          <p className="mt-1 text-ink-2">
            افتحها من صفحة الطلب في التطبيق عشان تتابعها. المتجر قدامه 48 ساعة يرد، ولو الحل مرضاكش فريق فاترينة بيراجع ويحكم.
          </p>
          <div className="mt-auto pt-5">
            <OpenInApp path={appPath.orders} variant="secondary">
              افتح طلباتي في التطبيق
            </OpenInApp>
          </div>
        </section>

        <section className={card}>
          <span className={tile}>
            <Store aria-hidden className="size-6" />
          </span>
          <h2 className="mt-4 text-section font-extrabold">صاحب متجر؟</h2>
          <p className="mt-1 text-ink-2">العمولة وطريقة السداد وخطوات فتح المتجر كلها في صفحة البيع على فاترينة.</p>
          <div className="mt-auto pt-5">
            <Link
              href="/sell"
              className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-bold transition-colors hover:border-brand"
            >
              ابدأ البيع على فاترينة
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="rounded-panel bg-sunken p-6 sm:p-8">
          <h2 className="text-section font-extrabold">عشان نساعدك أسرع، اكتب في الإيميل</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {INCLUDE.map((i) => (
              <li key={i} className="flex gap-2.5 text-ink-2">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" />
                {i}
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="روابط مساعدة" className="flex flex-col divide-y divide-line rounded-panel border border-line bg-surface">
          <Link href="/faq" className="flex min-h-16 items-center gap-3 px-5 font-bold transition-colors hover:text-accent">
            <CircleHelp aria-hidden className="size-5 shrink-0 text-ink-3" />
            <span>
              الأسئلة الشائعة
              <span className="block text-meta font-normal text-ink-2">يمكن إجابتك موجودة هنا</span>
            </span>
          </Link>
          <Link href="/delete-account" className="flex min-h-16 items-center gap-3 px-5 font-bold transition-colors hover:text-accent">
            <UserRoundX aria-hidden className="size-5 shrink-0 text-ink-3" />
            <span>
              حذف الحساب
              <span className="block text-meta font-normal text-ink-2">الخطوات من التطبيق أو بالإيميل</span>
            </span>
          </Link>
        </nav>
      </div>
    </Container>
  );
}
