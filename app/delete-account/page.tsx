import { Mail } from 'lucide-react';
import type { Metadata } from 'next';

import { LegalArticle } from '@/components/info/LegalArticle';
import { DELETE_ACCOUNT, LEGAL_UPDATED } from '@/lib/content';
import { SUPPORT_EMAIL } from '@/lib/links';

export const metadata: Metadata = {
  title: 'حذف الحساب',
  description: 'إزاي تمسح حسابك على فاترينة وبياناتك الشخصية: من التطبيق من «الإعدادات» › «حذف الحساب»، أو بإيميل للدعم.',
  alternates: { canonical: '/delete-account' },
};

const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('حذف حساب')}`;

export default function DeleteAccountPage() {
  return (
    <LegalArticle doc={DELETE_ACCOUNT} current="/delete-account" updated={LEGAL_UPDATED} fill={(s) => s.replaceAll('{email}', SUPPORT_EMAIL)}>
      <a
        href={mailto}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand"
      >
        <Mail aria-hidden className="size-5" />
        ابعت طلب حذف بالإيميل
      </a>
    </LegalArticle>
  );
}
