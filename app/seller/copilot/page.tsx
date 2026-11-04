import type { Metadata } from 'next';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { CopilotChat } from '@/components/seller/copilot/CopilotChat';
import { getMyBrand } from '@/components/seller/data';
import { requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'مساعدك الذكي',
  robots: { index: false, follow: false },
};

export default async function CopilotPage() {
  await requireSeller('/seller/copilot');
  const brand = await getMyBrand();

  return (
    <>
      <PageTitle title="مساعدك الذكي" body="اسأله عن أرقام متجرك، أو خليه يكتبلك وصف منتج، رد على عميل، أو فكرة عرض." />
      {brand ? (
        <div className="h-[calc(100dvh-14rem)] max-h-[52rem] min-h-[26rem] overflow-hidden rounded-panel border border-line bg-surface">
          <CopilotChat brandId={brand.id} />
        </div>
      ) : (
        <LoadError what="بيانات المتجر" retryHref="/seller/copilot" />
      )}
    </>
  );
}
