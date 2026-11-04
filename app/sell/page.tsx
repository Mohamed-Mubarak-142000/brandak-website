import { BadgeCheck, Clock, Percent } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { FaqList } from '@/components/info/FaqList';
import { OpenInApp } from '@/components/OpenInApp';
import { QrCode } from '@/components/QrCode';
import { SectionHeader } from '@/components/SectionHeader';
import { CommissionDeal } from '@/components/sell/CommissionDeal';
import { SellerDesk } from '@/components/sell/SellerDesk';
import { StoreTypeFronts } from '@/components/sell/StoreTypeFronts';
import { getBrands, getTerms } from '@/lib/api';
import { sellerFaq, withRate } from '@/lib/content';
import { num, percent } from '@/lib/format';
import { appPath, SITE_URL } from '@/lib/links';
import { STORE_TYPES } from '@/lib/store-types';

export const metadata: Metadata = {
  title: 'ابدأ البيع على فاترينة',
  description:
    'افتح متجرك على فاترينة ببلاش: براند أو معرض أو مخزن أو محل. عمولة بس على الطلبات اللي بتتسلّم، والدفع كاش عند الاستلام، وعملاء من كل محافظات مصر.',
  alternates: { canonical: '/sell' },
};

/** The real order of things in the app's seller flow. */
const STEPS = [
  { title: 'حمّل التطبيق', body: 'نزّل فاترينة من Google Play واعمل حساب بإيميلك.' },
  { title: 'افتح متجرك واختار نوع النشاط', body: 'من الحساب دوس «افتح متجرك»: البيانات والأقسام والتواصل، واللوجو والغلاف.' },
  { title: 'المراجعة', body: 'فريقنا بيراجع بيانات المتجر، عادةً خلال يوم عمل، ويوصلك إشعار أول ما يتفعّل.' },
  { title: 'ضيف منتجاتك واستقبل الطلبات', body: 'ارفع منتجاتك، والطلبات بتوصلك بإشعار على موبايلك.' },
];

export default async function SellPage() {
  const [terms, ...counts] = await Promise.all([getTerms(), ...STORE_TYPES.map((t) => getBrands({ storeType: t.type, limit: 1 }))]);
  const rate = percent(terms.commissionRate);
  const storeCounts = Object.fromEntries(STORE_TYPES.map((t, i) => [t.type, counts[i].total]));
  const faq = sellerFaq().map((i) => ({ q: i.q, a: withRate(i.a, terms.commissionRate) }));

  const chips = [
    { icon: BadgeCheck, text: 'فتح ببلاش' },
    { icon: Percent, text: `${rate} بس لما تبيع` },
    { icon: Clock, text: 'مراجعة خلال يوم عمل' },
  ];

  return (
    <>
      {/* Hero */}
      <Container className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-ui font-semibold text-ink-2">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            العمولة الحالية {rate} من قيمة المنتجات، والسداد كل {num(terms.settlementDays)} يوم
          </p>
          <h1 className="mt-5 text-page font-extrabold sm:text-display">
            افتح متجرك على فاترينة <span className="text-accent">وابدأ تبيع النهارده</span>
          </h1>
          <p className="mt-4 max-w-xl text-body text-ink-2 sm:text-section sm:leading-relaxed">
            فتح المتجر ببلاش، وبتدفع {rate} بس من قيمة المنتجات لما الطلب يتسلّم للعميل. والعميل بيدفع كاش عند الاستلام في أي محافظة.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <OpenInApp path={appPath.sell} className="min-h-12 px-6 text-body">
              افتح متجرك من التطبيق
            </OpenInApp>
            <a
              href="#deal"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong bg-surface px-6 font-bold text-ink transition-colors hover:border-brand"
            >
              اعرف الحساب
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {chips.map(({ icon: Icon, text }) => (
              <li key={text} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sunken px-4 text-ui font-bold">
                <Icon aria-hidden className="size-4 text-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-window bg-sunken p-6 sm:p-8">
          <Image
            src="/illustrations/onboarding-sell.png"
            alt="صاحب متجر بيجهّز طلبات من موبايله"
            width={640}
            height={640}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 60vw, 80vw"
            loading="eager"
            fetchPriority="high"
            className="mx-auto h-auto w-4/5 max-w-sm lg:w-full lg:max-w-none"
          />
        </div>
      </Container>

      {/* Store types */}
      <section className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="مهما كان نوع شغلك ليك مكان" body="اختار نوع نشاطك وانت بتفتح المتجر، والتطبيق بيجهّزلك طريقة عرض المنتجات اللي تناسبه." />
          <StoreTypeFronts counts={storeCounts} />
        </Container>
      </section>

      {/* The deal */}
      <section id="deal" className="scroll-mt-36 bg-sunken sm:scroll-mt-44">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="الحساب واضح من الأول" body="الأرقام دي هي الشروط الحالية، ولو اتغيرت هنبلّغك قبلها." />
          <CommissionDeal terms={terms} />
        </Container>
      </section>

      {/* Seller desk */}
      <Container className="py-12 sm:py-16">
        <SectionHeader title="لوحة متجرك في موبايلك" body="كل اللي محتاجه عشان تدير متجرك وتبيع أكتر، من غير كمبيوتر." />
        <SellerDesk />
      </Container>

      {/* Steps */}
      <section className="border-y border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="تبدأ إزاي" body="أربع خطوات من التحميل لأول طلب." />
          <ol className="grid lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="group flex gap-4 lg:flex-col">
                <div aria-hidden className="flex flex-col items-center lg:-me-6 lg:flex-row lg:group-last:me-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent font-extrabold text-on-accent">{num(i + 1)}</span>
                  <span className="my-2 w-px flex-1 bg-line-strong group-last:hidden lg:mx-3 lg:my-0 lg:h-px lg:w-auto" />
                </div>
                <div className="pb-8 pt-2 lg:pb-0 lg:pt-0">
                  <h3 className="font-extrabold">
                    <span className="sr-only">الخطوة {num(i + 1)}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-1 text-ui text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-48 lg:self-start">
          <h2 className="text-section font-extrabold sm:text-page">أسئلة أصحاب المتاجر</h2>
          <p className="mt-2 text-ink-2">أكتر حاجات بيسألوا عنها قبل ما يفتحوا.</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/faq#sellers" className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
              كل أسئلة البيع
            </Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center font-bold text-ink-2 underline-offset-4 hover:text-accent hover:underline">
              كلّمنا
            </Link>
          </div>
        </div>
        <FaqList items={faq} />
      </Container>

      {/* Closing */}
      <Container className="pb-16">
        <div className="flex flex-col gap-8 rounded-window border border-line bg-sunken p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Image src="/brand/fatrina-mark.png" alt="" width={56} height={56} className="size-14 shrink-0" />
            <div>
              <h2 className="text-section font-extrabold sm:text-page">جاهز تفتح فاترينتك؟</h2>
              <p className="mt-1 max-w-xl text-ink-2">افتح النهارده ببلاش، ومتجرك يبقى قدام العملاء بعد المراجعة.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <OpenInApp path={appPath.sell} className="min-h-12 px-6 text-body">
                  افتح متجرك من التطبيق
                </OpenInApp>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center rounded-full border border-line-strong bg-surface px-6 font-bold transition-colors hover:border-brand"
                >
                  عندك سؤال؟ كلّمنا
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-4 rounded-panel bg-surface p-4 shadow-card lg:flex">
            <QrCode value={`${SITE_URL}/download?open=${encodeURIComponent(appPath.sell)}`} size={112} label="كود QR لفتح متجر من تطبيق فاترينة" />
            <p className="max-w-36 text-ui font-bold">امسح الكود بموبايلك وابدأ على طول</p>
          </div>
        </div>
      </Container>
    </>
  );
}
