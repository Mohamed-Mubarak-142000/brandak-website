import { Mail } from 'lucide-react';
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

export default function ContactPage() {
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-sign text-page sm:text-display">تواصل معانا</h1>
      <p className="mt-2 max-w-2xl text-body text-ink-2 sm:text-section sm:leading-relaxed">ابعتلنا إيميل وهنرد عليك في أقرب وقت.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-panel border border-line bg-surface p-6">
          <h2 className="text-section font-extrabold">الإيميل</h2>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            dir="ltr"
            className="mt-3 inline-flex min-h-11 max-w-full items-center gap-2 break-all font-bold text-accent underline-offset-4 hover:underline"
          >
            <Mail aria-hidden className="size-5 shrink-0" />
            {SUPPORT_EMAIL}
          </a>
          <h3 className="mt-6 font-bold">عشان نساعدك أسرع، اكتب في الإيميل:</h3>
          <ul className="mt-2 space-y-1.5 ps-5 text-ink-2 marker:text-brand list-disc">
            {INCLUDE.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-panel bg-sunken p-6">
            <h2 className="text-section font-extrabold">مشكلة في طلب؟</h2>
            <p className="mt-2 text-ink-2">
              لو عندك مشكلة في طلب افتحها من صفحة الطلب في التطبيق عشان تتابعها. المتجر قدامه 48 ساعة يرد، ولو الحل مرضاكش فريق فاترينة بيراجع ويحكم.
            </p>
            <OpenInApp path={appPath.orders} variant="secondary" className="mt-4">
              افتح طلباتي في التطبيق
            </OpenInApp>
          </section>

          <section className="rounded-panel bg-sunken p-6">
            <h2 className="text-section font-extrabold">صاحب متجر أو عايز تفتح متجر؟</h2>
            <p className="mt-2 text-ink-2">العمولة وطريقة السداد وخطوات فتح المتجر كلها في صفحة البيع على فاترينة.</p>
            <Link href="/sell" className="mt-3 inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
              ابدأ البيع على فاترينة
            </Link>
          </section>

          <p className="text-ui text-ink-3">
            عايز تمسح حسابك؟ الخطوات في{' '}
            <Link href="/delete-account" className="font-bold text-accent underline-offset-4 hover:underline">
              صفحة حذف الحساب
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
