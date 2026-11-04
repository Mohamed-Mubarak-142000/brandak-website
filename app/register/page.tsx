import { Heart, PackageCheck, Store } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthSplit } from '@/components/auth/AuthCard';
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
    <AuthSplit
      mode="register"
      next={next}
      title="اعمل حسابك"
      subtitle="ثواني وتبدأ تتسوّق من كل المتاجر."
      headline={
        <>
          حسابك الأول
          <br />
          على فاترينة
        </>
      }
      perks={[
        { icon: Store, title: 'متاجر كتير في مكان واحد', text: 'من غير ما تعمل حساب في كل متجر لوحده.' },
        { icon: PackageCheck, title: 'تابع طلباتك', text: 'هتعرف طلبك فين لحد ما يوصل لباب البيت.' },
        { icon: Heart, title: 'احفظ اللي عجبك', text: 'زوّد المفضلة وارجعلها في أي وقت.' },
      ]}
    >
      <RegisterForm next={next} />
    </AuthSplit>
  );
}
