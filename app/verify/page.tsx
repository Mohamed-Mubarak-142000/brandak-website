import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthCard } from '@/components/auth/AuthCard';
import { first, type AuthSearch } from '@/components/auth/params';
import { VerifyForm } from '@/components/auth/VerifyForm';
import { requireSession, safeNext } from '@/lib/session';

export const metadata: Metadata = {
  title: 'أكّد إيميلك',
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ searchParams }: { searchParams: AuthSearch }) {
  const sp = await searchParams;
  const next = safeNext(first(sp.next));
  const { user } = await requireSession(`/verify?next=${encodeURIComponent(next)}`);
  if (user.emailVerified) redirect(next);

  return (
    <AuthCard
      title="أكّد إيميلك"
      subtitle={
        <>
          بعتنا كود من 6 أرقام على{' '}
          <bdi dir="ltr" className="font-semibold text-ink">
            {user.email}
          </bdi>
          . لو مش لاقيه بص في الـ Spam.
        </>
      }
    >
      <VerifyForm next={next} sent={first(sp.sent) === '1'} welcome={first(sp.welcome) === '1'} />
    </AuthCard>
  );
}
