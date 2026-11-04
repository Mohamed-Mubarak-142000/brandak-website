import { Heart, PackageCheck, Store } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthSplit } from '@/components/auth/AuthCard';
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
    <AuthSplit
      mode="login"
      next={next}
      title="أهلاً بيك تاني"
      subtitle="سجّل دخول عشان تكمل طلباتك ومفضلتك."
      headline={
        <>
          كل المتاجر
          <br />
          في فاترينة واحدة
        </>
      }
      perks={[
        { icon: PackageCheck, title: 'طلباتك قدامك', text: 'تابع كل طلب خطوة بخطوة لحد ما يوصلك.' },
        { icon: Heart, title: 'مفضلتك محفوظة', text: 'اللي عجبك هتلاقيه مستنيك على أي جهاز.' },
        { icon: Store, title: 'متاجر كتير', text: 'اتسوّق من أكتر من متجر في سلة واحدة.' },
      ]}
    >
      <LoginForm next={next} />
    </AuthSplit>
  );
}
