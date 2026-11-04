import { MailWarning } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AccountSideNav } from '@/components/account/AccountSideNav';
import { Container } from '@/components/Container';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: { default: 'حسابي | فاترينة', template: '%s | حسابي | فاترينة' },
  robots: { index: false, follow: false },
};

/**
 * The account frame. Each page calls requireSession with its own path (a layout can't know it), so
 * when nobody is signed in this renders the page alone and the page redirects to /login.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { session } = await getSession();
  if (!session) return children;
  const { user } = session;

  return (
    <div className="bg-sunken">
      <Container className="py-6 sm:py-10">
        {!user.emailVerified ? (
          <div role="status" className="mb-6 flex flex-wrap items-center gap-3 rounded-panel border border-warning/20 bg-warning-soft px-4 py-3 text-warning">
            <MailWarning aria-hidden className="size-5 shrink-0" />
            <p className="min-w-0 flex-1 text-ui font-semibold">إيميلك لسه متأكدش. أكّده عشان تأمّن حسابك وطلباتك توصل للمتاجر من غير تأخير.</p>
            <Link href="/verify?next=/account" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-ui font-bold text-on-accent hover:bg-accent-hover">
              أكّد إيميلك
            </Link>
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="lg:sticky lg:top-[180px]">
            <AccountSideNav name={user.name} email={user.email} />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}
