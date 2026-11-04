import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { first, type AuthSearch } from '@/components/auth/params';
import { getSession, safeNext } from '@/lib/session';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: AuthSearch }) {
  const next = safeNext(first((await searchParams).next));
  if ((await getSession()).session) redirect(next);

  return (
    <AuthCard
      title="أهلاً بيك تاني"
      subtitle="سجّل دخول عشان تكمل طلباتك ومفضلتك."
      footer={
        <>
          أول مرة على فاترينة؟{' '}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-accent hover:underline underline-offset-4">
            اعمل حساب جديد
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
