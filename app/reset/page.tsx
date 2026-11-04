import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthCard } from '@/components/auth/AuthCard';
import { first, type AuthSearch } from '@/components/auth/params';
import { ResetForm } from '@/components/auth/ResetForm';
import { getSession, safeNext } from '@/lib/session';

export const metadata: Metadata = {
  title: 'كلمة سر جديدة',
  robots: { index: false, follow: false },
};

export default async function ResetPage({ searchParams }: { searchParams: AuthSearch }) {
  const sp = await searchParams;
  const next = safeNext(first(sp.next));
  const identifier = first(sp.identifier).trim();
  if ((await getSession()).session) redirect('/account/settings');
  if (!identifier) redirect(`/forgot?next=${encodeURIComponent(next)}`);

  return (
    <AuthCard
      title="كلمة سر جديدة"
      subtitle={
        <>
          اكتب الكود اللي وصلك على{' '}
          <bdi dir="ltr" className="font-semibold text-ink">
            {identifier}
          </bdi>
        </>
      }
      footer={
        <Link href={`/forgot?next=${encodeURIComponent(next)}`} className="font-bold text-accent hover:underline underline-offset-4">
          غيّر الإيميل أو الرقم
        </Link>
      }
    >
      <ResetForm identifier={identifier} next={next} />
    </AuthCard>
  );
}
