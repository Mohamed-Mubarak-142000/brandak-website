import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { FaqList } from '@/components/info/FaqList';
import { OpenInApp } from '@/components/OpenInApp';
import { SectionHeader } from '@/components/SectionHeader';
import { CommissionDeal } from '@/components/sell/CommissionDeal';
import { SellerDesk } from '@/components/sell/SellerDesk';
import { StoreTypeFronts } from '@/components/sell/StoreTypeFronts';
import { getBrands, getTerms } from '@/lib/api';
import { sellerFaq, withRate } from '@/lib/content';
import { percent } from '@/lib/format';
import { appPath } from '@/lib/links';
import { STORE_TYPES } from '@/lib/store-types';

export const metadata: Metadata = {
  title: 'ابدأ البيع على فاترينة',
  description:
    'افتح متجرك على فاترينة ببلاش: براند أو معرض أو مخزن أو محل. عمولة بس على الطلبات اللي بتتسلّم، والدفع كاش عند الاستلام، وعملاء من كل محافظات مصر.',
  alternates: { canonical: '/sell' },
};

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

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-sunken">
        <Container className="grid items-center gap-8 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <div>
            <h1 className="font-sign text-display sm:text-hero">افتح متجرك على فاترينة وابدأ تبيع النهارده</h1>
            <p className="mt-4 max-w-xl text-body text-ink-2 sm:text-section sm:leading-relaxed">
              فتح المتجر ببلاش، وبتدفع {rate} بس من قيمة المنتجات لما الطلب يتسلّم للعميل. والعميل بيدفع كاش عند الاستلام في أي محافظة.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <OpenInApp path={appPath.sell} className="min-h-12 px-6 text-body">
                افتح متجرك من التطبيق
              </OpenInApp>
              <a href="#deal" className="inline-flex min-h-11 items-center font-bold text-accent underline-offset-4 hover:underline">
                اعرف الحساب بالظبط
              </a>
            </div>
          </div>
          <Image
            src="/illustrations/onboarding-sell.png"
            alt="صاحب متجر بيجهّز طلبات من موبايله"
            width={1254}
            height={1254}
            sizes="(min-width: 1024px) 416px, (min-width: 640px) 60vw, 80vw"
            loading="eager"
            fetchPriority="high"
            className="mx-auto h-auto w-4/5 max-w-sm lg:w-full lg:max-w-none"
          />
        </Container>
      </section>

      {/* Store types */}
      <Container className="py-12 sm:py-16">
        <SectionHeader title="مهما كان نوع شغلك ليك مكان" body="اختار نوع نشاطك وانت بتفتح المتجر، والتطبيق بيجهّزلك طريقة عرض المنتجات اللي تناسبه." />
        <StoreTypeFronts counts={storeCounts} />
      </Container>

      {/* The deal */}
      <section id="deal" className="scroll-mt-20 border-y border-line bg-surface">
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
      <section className="bg-sunken">
        <Container className="py-12 sm:py-16">
          <SectionHeader title="تبدأ إزاي" />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 lg:flex-col lg:gap-2">
                <span aria-hidden className="font-sign text-display leading-none text-brand">
                  {(i + 1).toLocaleString('ar-EG')}
                </span>
                <div>
                  <h3 className="text-body font-extrabold">{s.title}</h3>
                  <p className="mt-1 text-ui text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <Container className="py-12 sm:py-16">
        <SectionHeader title="أسئلة أصحاب المتاجر" href="/faq#sellers" linkLabel="كل الأسئلة" />
        <div className="max-w-3xl">
          <FaqList items={faq} />
        </div>
      </Container>

      {/* Closing */}
      <Container className="pb-16">
        <div className="flex flex-col items-start gap-6 rounded-window bg-ink p-6 text-ground sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-sign text-page sm:text-display">جاهز تفتح فاترينتك؟</h2>
            <p className="mt-2 max-w-xl opacity-80">افتح النهارده ببلاش، ومتجرك يبقى قدام العملاء بعد المراجعة.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <OpenInApp path={appPath.sell} className="min-h-12 px-6 text-body">
              افتح متجرك من التطبيق
            </OpenInApp>
            <Link href="/contact" className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
              عندك سؤال؟ كلّمنا
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
