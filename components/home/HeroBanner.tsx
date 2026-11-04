import Image from 'next/image';
import Link from 'next/link';

import { safeColor } from '@/components/catalog/CampaignCard';
import { Carousel } from '@/components/ui/Carousel';
import { date, num, percent } from '@/lib/format';
import type { Campaign } from '@/lib/types';

type Art = 'onboarding-discover' | 'onboarding-shop' | 'onboarding-delivery' | 'onboarding-sell';

const cta =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-body font-bold text-on-accent transition-colors hover:bg-accent-hover';

/** One banner: tinted panel, sign-lettered headline, one line, one button, art on the far side. */
function Slide({
  background,
  title,
  body,
  action,
  side,
}: {
  background: string;
  title: string;
  body: string;
  action: React.ReactNode;
  side: React.ReactNode;
}) {
  return (
    <div
      style={{ background }}
      className="grid h-full min-h-120 grid-rows-[1fr_auto] items-center gap-4 px-6 pb-12 pt-8 sm:min-h-88 sm:grid-cols-[1.25fr_1fr] sm:grid-rows-1 sm:gap-6 sm:px-10 sm:py-10 md:px-14 lg:aspect-21/8 lg:min-h-0 lg:px-20"
    >
      <div className="max-w-xl">
        <h2 className="whitespace-pre-line font-sign text-[2.125rem] leading-tight text-ink sm:text-[2.5rem] lg:text-[3.25rem]">{title}</h2>
        <p className="mt-3 line-clamp-3 max-w-md text-body text-ink-2 sm:text-section sm:leading-relaxed">{body}</p>
        <div className="mt-6">{action}</div>
      </div>
      <div className="flex items-center justify-center sm:justify-end">{side}</div>
    </div>
  );
}

function Art({ name, priority }: { name: Art; priority?: boolean }) {
  return (
    <Image
      src={`/illustrations/${name}.png`}
      alt=""
      width={640}
      height={640}
      priority={priority}
      sizes="(min-width: 1024px) 380px, (min-width: 640px) 40vw, 200px"
      className="h-auto w-44 sm:w-full sm:max-w-76 lg:max-w-92"
    />
  );
}

/** A campaign's colour is a pale tint behind ink text, and a solid ring around its discount. */
function CampaignSide({ campaign }: { campaign: Campaign }) {
  const color = safeColor(campaign.color);
  return (
    <div style={{ borderColor: color }} className="grid size-44 place-items-center rounded-full border-10 bg-surface text-center shadow-pop sm:size-56 lg:size-64">
      {campaign.minPercent > 0 ? (
        <span className="leading-none">
          <span className="block text-ui font-bold text-ink-2">خصم لحد</span>
          <span className="mt-1 block font-sign text-[3.5rem] text-ink lg:text-[4.5rem]">{num(campaign.minPercent)}٪</span>
          <span className="mt-1 block text-ui font-bold text-ink-2">وأكتر</span>
        </span>
      ) : (
        <span className="px-4 font-sign text-page text-ink">{campaign.nameAr}</span>
      )}
    </div>
  );
}

/**
 * The home banner: running campaigns first (each in its own colour), then the four
 * onboarding promises. Plays by itself and loops.
 */
export function HeroBanner({ campaigns, commissionRate }: { campaigns: Campaign[]; commissionRate: number }) {
  // The API lists running campaigns only.
  const running = campaigns.slice(0, 3);

  const slides: React.ReactNode[] = [
    ...running.map((c) => (
      <Slide
        key={c._id}
        background={`color-mix(in srgb, ${safeColor(c.color)} 16%, #fff)`}
        title={c.nameAr}
        body={c.descriptionAr ? c.descriptionAr : `عروض شغّالة لحد ${date(c.endsAt)}.`}
        action={
          <Link href={`/campaigns/${c.slug}`} className={cta}>
            شوف العروض
          </Link>
        }
        side={<CampaignSide campaign={c} />}
      />
    )),
    <Slide
      key="discover"
      background="var(--accent-soft)"
      title={'معارض ومحلات ومخازن\nوبراندات في مكان واحد'}
      body="اكتشف منتجات من متاجر مصرية من كل نوع، وقارن واختار اللي يناسبك."
      action={
        <Link href="/stores" className={cta}>
          تصفّح المتاجر
        </Link>
      }
      side={<Art name="onboarding-discover" priority={!running.length} />}
    />,
    <Slide
      key="shop"
      background="#eef4fb"
      title={'سلة لكل متجر،\nوتتبّع لحد بابك'}
      body="اطلب من أكتر من متجر في نفس الوقت هنا على الموقع، وتابع كل طلب من التأكيد للتوصيل."
      action={
        <Link href="/stores" className={cta}>
          ابدأ التسوّق
        </Link>
      }
      side={<Art name="onboarding-shop" />}
    />,
    <Slide
      key="cash"
      background="#edf6f0"
      title={'ادفع كاش\nلما الطلب يوصلك'}
      body="مفيش دفع مقدّم، والتقييمات من ناس اشترت واستلمت فعلًا."
      action={
        <Link href="/faq" className={cta}>
          اعرف أكتر
        </Link>
      }
      side={<Art name="onboarding-delivery" />}
    />,
    <Slide
      key="sell"
      background="var(--sunken)"
      title={'عندك متجر؟\nافتحه ببلاش'}
      body={`وادفع ${percent(commissionRate)} بس لما تبيع. ولوحة تحكم كاملة من موبايلك.`}
      action={
        <Link href="/sell" className={cta}>
          ابدأ البيع
        </Link>
      }
      side={<Art name="onboarding-sell" />}
    />,
  ];

  return (
    <Carousel label="عروض وأخبار فاترينة" delay={6000} className="mt-4 sm:mt-6">
      {slides}
    </Carousel>
  );
}
