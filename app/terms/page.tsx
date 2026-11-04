import type { Metadata } from 'next';

import { LegalArticle } from '@/components/info/LegalArticle';
import { getTerms } from '@/lib/api';
import { LEGAL_UPDATED, TERMS, withRate } from '@/lib/content';

export const metadata: Metadata = {
  title: TERMS.title,
  description: 'الشروط اللي بتنظم استخدام فاترينة للعملاء وأصحاب المتاجر: الطلبات، الدفع كاش عند الاستلام، الشحن والاسترجاع، والعمولة.',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const { commissionRate } = await getTerms();
  return <LegalArticle doc={TERMS} current="/terms" updated={LEGAL_UPDATED} fill={(s) => withRate(s, commissionRate)} />;
}
