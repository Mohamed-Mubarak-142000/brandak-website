import type { Metadata } from 'next';

import { Container } from '@/components/Container';
import { CopilotDock } from '@/components/seller/copilot/CopilotDock';
import { getMyBrand } from '@/components/seller/data';
import { SellerNav } from '@/components/seller/SellerNav';

export const metadata: Metadata = {
  title: { default: 'لوحة متجري | فاترينة', template: '%s | لوحة متجري | فاترينة' },
  robots: { index: false, follow: false },
};

/**
 * The store-owner frame. A layout can't know the pathname, so each page runs its own guard
 * (requireSeller / requireSession). With no store yet (or nobody signed in) this renders the page
 * alone — that's /seller/apply, or a page that is about to redirect.
 */
export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const brand = await getMyBrand();
  if (!brand) return <div className="bg-sunken">{children}</div>;

  return (
    <div className="bg-sunken">
      <Container className="py-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="lg:sticky lg:top-45 lg:max-h-[calc(100dvh-196px)] lg:overflow-y-auto lg:pb-2">
            <SellerNav brand={{ name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl, storeType: brand.storeType, status: brand.status }} />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
      <CopilotDock />
    </div>
  );
}
