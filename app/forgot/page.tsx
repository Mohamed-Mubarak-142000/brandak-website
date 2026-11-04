import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotForm } from '@/components/auth/ForgotForm';
import { first, type AuthSearch } from '@/components/auth/params';
import { getSession, safeNext } from '@/lib/session';

export const metadata: Metadata = {
  title: 'نسيت كلمة السر',
  robots: { index: false, follow: false },
};

export default async function ForgotPage({ searchParams }: { searchParams: AuthSearch }) {
  const next = safeNext(first((await searchParams).next));
  // Signed in already: changing the password lives in the settings.
  if ((await getSession()).session) redirect('/account/settings');

  return (
    <AuthCard
      title="نسيت كلمة السر؟"
      subtitle="اكتب إيميلك أو رقمك وهنبعتلك كود تغيّر بيه كلمة السر."
      footer={
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-accent hover:underline underline-offset-4">
          افتكرتها؟ ارجع لتسجيل الدخول
        </Link>
      }
    >
      <ForgotForm next={next} />
    </AuthCard>
  );
}
