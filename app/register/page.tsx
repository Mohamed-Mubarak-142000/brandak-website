import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthCard } from '@/components/auth/AuthCard';
import { first, type AuthSearch } from '@/components/auth/params';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { getSession, safeNext } from '@/lib/session';

export const metadata: Metadata = {
  title: 'حساب جديد',
  robots: { index: false, follow: false },
};

export default async function RegisterPage({ searchParams }: { searchParams: AuthSearch }) {
  const next = safeNext(first((await searchParams).next));
  if ((await getSession()).session) redirect(next);

  return (
    <AuthCard
      title="حساب جديد"
      subtitle="ثواني وتبدأ تتسوّق من كل المتاجر."
      footer={
        <>
          عندك حساب؟{' '}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-accent hover:underline underline-offset-4">
            سجّل دخول
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
