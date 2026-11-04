import { Eye } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { Alert } from '@/components/auth/fields';
import { getMyBrand } from '@/components/seller/data';
import { AcceptingForm, PickupForm, PoliciesForm, ProfileForm, ShippingForm } from '@/components/seller/settings/SettingsForms';
import { getCategories, getGovernorates } from '@/lib/api';
import { requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'إعدادات المتجر',
  robots: { index: false, follow: false },
};

/** Store profile, shipping, policies and pickup (PATCH brands/me, one section at a time). Assistant settings live on /seller/assistant. */
export default async function SellerSettingsPage() {
  await requireSeller('/seller/settings');
  const [brand, categories, governorates] = await Promise.all([getMyBrand(), getCategories(), getGovernorates()]);
  if (!brand) return <LoadError what="إعدادات المتجر" retryHref="/seller/settings" />;
  // Stores pick top-level sections only.
  const sections = categories.filter((c) => !c.parentId);

  return (
    <>
      <PageTitle
        title="إعدادات المتجر"
        body="بيانات المتجر والشحن والسياسات. كل جزء بيتحفظ لوحده."
        action={
          <Link href={`/brand/${brand.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 text-ui font-bold hover:border-brand hover:text-accent">
            <Eye aria-hidden className="size-4" />
            معاينة المتجر
          </Link>
        }
      />
      <div className="flex flex-col gap-5">
        {brand.status === 'SUSPENDED' ? <Alert tone="danger" title="المتجر موقوف مؤقتاً ومينفعش يتعدّل دلوقتي.">كلّم فريق فاترينة لمعرفة التفاصيل.</Alert> : null}
        <ProfileForm brand={brand} categories={sections} />
        <AcceptingForm settings={brand.settings} />
        <ShippingForm settings={brand.settings} governorates={governorates} />
        <PoliciesForm settings={brand.settings} />
        <PickupForm settings={brand.settings} governorates={governorates} />
      </div>
    </>
  );
}
