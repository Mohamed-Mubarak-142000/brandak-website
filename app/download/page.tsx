import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { Container } from '@/components/Container';
import { AndroidOpen } from '@/components/info/AndroidOpen';
import { PhoneFrame } from '@/components/info/PhoneFrame';
import { QrCode } from '@/components/QrCode';
import { PLAY_URL, SITE_URL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'حمّل تطبيق فاترينة',
  description: 'حمّل فاترينة ببلاش من Google Play: براندات ومعارض ومخازن ومحلات مصرية في مكان واحد، والدفع كاش عند الاستلام.',
  alternates: { canonical: '/download' },
};

const SCREENS = [
  { src: '/screens/2-home.png', alt: 'الصفحة الرئيسية في تطبيق فاترينة' },
  { src: '/screens/4-product.png', alt: 'صفحة منتج في تطبيق فاترينة' },
  { src: '/screens/6-store.png', alt: 'صفحة متجر في تطبيق فاترينة' },
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
  const qrValue = `${SITE_URL}/download${path ? `?open=${encodeURIComponent(path)}` : ''}`;

  return (
    <Container className="py-10 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="min-w-0">
          <h1 className="font-sign text-page sm:text-display">حمّل فاترينة على موبايلك</h1>
          <p className="mt-3 max-w-xl text-body text-ink-2 sm:text-section sm:leading-relaxed">
            {note ?? 'براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. اطلب وادفع كاش لما الطلب يوصلك.'}
          </p>

          <div className="mt-8">
            <AndroidOpen path={path} serverGuess={android} />
          </div>

          {!android ? (
            <div className="flex flex-col gap-6 rounded-window bg-sunken p-6 sm:flex-row sm:items-center sm:p-8">
              <QrCode value={qrValue} size={200} label="كود QR لتحميل تطبيق فاترينة" />
              <div className="min-w-0">
                <p className="text-section font-extrabold">امسح الكود بكاميرا موبايلك</p>
                <p className="mt-1 text-ink-2">
                  {note ? `وبعد ما تنزّله، ${note}` : 'هيفتحلك صفحة التحميل على موبايلك على طول.'}
                </p>
                <p className="mt-1 text-ui text-ink-3">متاح دلوقتي على أندرويد.</p>
                <a
                  href={PLAY_URL}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand"
                >
                  افتحه على Google Play
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-center gap-3 sm:gap-4" aria-label="صور من التطبيق" role="group">
          {SCREENS.map((s, i) => (
            <PhoneFrame
              key={s.src}
              src={s.src}
              alt={s.alt}
              priority={i === 0}
              className={i === 1 ? 'w-[30%] max-w-44 -translate-y-4 sm:w-44' : 'w-[30%] max-w-44 translate-y-4 sm:w-44'}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
