import type { Metadata } from 'next';

import { LegalArticle } from '@/components/info/LegalArticle';
import { LEGAL_UPDATED, PRIVACY } from '@/lib/content';

export const metadata: Metadata = {
  title: PRIVACY.title,
  description: 'فاترينة بتجمع إيه من بياناتك، وليه، ومين بيشوفها، وإزاي تعدّلها أو تمسح حسابك.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalArticle doc={PRIVACY} current="/privacy" updated={LEGAL_UPDATED} />;
}
