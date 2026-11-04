import { Banknote, Check, Play, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { Container } from '@/components/Container';
import { AndroidOpen } from '@/components/info/AndroidOpen';
import { PhoneFrame } from '@/components/info/PhoneFrame';
import { QrCode } from '@/components/QrCode';
import { Carousel } from '@/components/ui/Carousel';
import { PLAY_URL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'حمّل تطبيق فاترينة',
  description: 'حمّل فاترينة ببلاش من Google Play: براندات ومعارض ومخازن ومحلات مصرية في مكان واحد، والدفع كاش عند الاستلام.',
  alternates: { canonical: '/download' },
};

const SCREENS = [
  { src: '/screens/1-welcome.png', alt: 'شاشة الترحيب في تطبيق فاترينة' },
  { src: '/screens/2-home.png', alt: 'الصفحة الرئيسية في تطبيق فاترينة' },
  { src: '/screens/3-explore.png', alt: 'استكشاف المتاجر والأقسام في تطبيق فاترينة' },
  { src: '/screens/4-product.png', alt: 'صفحة منتج في تطبيق فاترينة' },
  { src: '/screens/5-product-details.png', alt: 'تفاصيل المنتج ومقاساته في تطبيق فاترينة' },
  { src: '/screens/6-store.png', alt: 'صفحة متجر في تطبيق فاترينة' },
  { src: '/screens/7-store-products.png', alt: 'منتجات متجر في تطبيق فاترينة' },
];

/** The three shown side by side on large screens. */
const FEATURED = [SCREENS[1], SCREENS[3], SCREENS[5]];

const PROMISES = [
  { icon: Check, text: 'التطبيق ببلاش، والتصفح من غير حساب' },
  { icon: Banknote, text: 'الدفع كاش لما الطلب يوصلك' },
  { icon: Truck, text: 'شحن لكل محافظات مصر' },
  { icon: ShieldCheck, text: 'متاجر متراجعة وتقييمات من ناس اشترت' },
];

/** Only app paths like "product/123" or "seller/apply"; anything else opens the app's home. */
function cleanPath(open: string | string[] | undefined) {
  const v = Array.isArray(open) ? open[0] : open;
  return v && v.length <= 200 && /^[\w\-/]+$/.test(v) ? v : '';
}

function targetNote(path: string) {
  if (path.startsWith('product/')) return 'هيفتحلك نفس المنتج في التطبيق.';
  if (path.startsWith('brand/')) return 'هيفتحلك نفس المتجر في التطبيق.';
  if (path.startsWith('category/')) return 'هيفتحلك نفس القسم في التطبيق.';
  if (path === 'offers') return 'هيفتحلك العروض في التطبيق.';
  if (path.startsWith('seller/')) return 'هيفتحلك خطوات فتح متجرك في التطبيق.';
  return null;
}

export default async function DownloadPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const path = cleanPath((await searchParams).open);
  const android = /android/i.test((await headers()).get('user-agent') ?? '');
  const note = targetNote(path);

  return (
    <Container className="py-10 sm:py-14">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14">
        <div className="min-w-0">
          <h1 className="text-page font-extrabold sm:text-display">حمّل فاترينة على موبايلك</h1>
          <p className="mt-3 max-w-xl text-body text-ink-2 sm:text-section sm:leading-relaxed">
            {/* Only Android opens the exact screen; the QR elsewhere goes straight to Google Play. */}
            {(android && note) || 'براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. اطلب وادفع كاش لما الطلب يوصلك.'}
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-ui font-semibold">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-8 empty:hidden">
            <AndroidOpen path={path} serverGuess={android} />
          </div>

          {!android ? (
            <div className="mt-8 flex flex-col gap-6 rounded-window border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:p-7">
              <div className="shrink-0 self-center rounded-panel bg-sunken p-3">
                <QrCode value={PLAY_URL} size={184} label="كود QR لتطبيق فاترينة على Google Play" />
              </div>
              <div className="min-w-0">
                <p className="text-section font-extrabold">امسح الكود بكاميرا موبايلك</p>
                <p className="mt-1 text-ink-2">هيفتحلك فاترينة على Google Play على طول.</p>
                <a
                  href={PLAY_URL}
                  className="mt-5 inline-flex min-h-14 items-center gap-3 rounded-card bg-ink px-5 text-surface transition-opacity hover:opacity-90"
                >
                  <Play aria-hidden className="size-6 fill-current" />
                  <span className="text-start leading-tight">
                    <span className="block text-meta opacity-80">حمّله من</span>
                    <span dir="ltr" className="block font-extrabold">
                      Google Play
                    </span>
                  </span>
                </a>
                <p className="mt-3 text-meta text-ink-3">متاح دلوقتي على أندرويد.</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Screens: a swipeable phone on small screens, three phones side by side on large ones. */}
        <div className="mx-auto w-full max-w-sm lg:hidden">
          <Carousel label="صور من تطبيق فاترينة" delay={3500} slideClassName="flex justify-center bg-sunken py-8">
            {SCREENS.map((s) => (
              <PhoneFrame key={s.src} src={s.src} alt={s.alt} sizes="224px" className="w-56" />
            ))}
          </Carousel>
        </div>
        <div className="hidden items-center justify-center gap-4 rounded-window bg-sunken px-6 py-12 lg:flex" role="group" aria-label="صور من تطبيق فاترينة">
          {FEATURED.map((s, i) => (
            <PhoneFrame
              key={s.src}
              src={s.src}
              alt={s.alt}
              priority={i === 1}
              sizes="160px"
              className={i === 1 ? 'w-40 -translate-y-5' : 'w-36 translate-y-5'}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
