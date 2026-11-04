import { BadgeCheck, MailWarning } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { SignOutButton } from '@/components/account/AccountSideNav';
import { PageTitle, Panel } from '@/components/account/PageTitle';
import { DeleteAccountForm, PasswordForm, ProfileForm } from '@/components/account/SettingsForms';
import { formatPhone } from '@/components/auth/validation';
import { SUPPORT_EMAIL } from '@/lib/links';
import { requireSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'الإعدادات',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const { user } = await requireSession('/account/settings');

  return (
    <>
      <PageTitle title="الإعدادات" body="بياناتك وكلمة السر والتحكم في حسابك." />
      <div className="flex flex-col gap-5">
        <Panel title="بياناتك">
          <div className="grid gap-5 md:grid-cols-2">
            <ProfileForm name={user.name} />
            <dl className="flex flex-col gap-4 text-ui">
              <div>
                <dt className="font-semibold">الإيميل</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <bdi dir="ltr" className="text-ink-2">
                    {user.email}
                  </bdi>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-meta font-bold text-success">
                      <BadgeCheck aria-hidden className="size-3.5" />
                      متأكد
                    </span>
                  ) : (
                    <Link href="/verify?next=/account/settings" className="inline-flex min-h-8 items-center gap-1 rounded-full bg-warning-soft px-2.5 text-meta font-bold text-warning hover:underline">
                      <MailWarning aria-hidden className="size-3.5" />
                      أكّد إيميلك
                    </Link>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">رقم الموبايل</dt>
                <dd className="mt-1">
                  <bdi dir="ltr" className="text-ink-2">
                    {formatPhone(user.phone)}
                  </bdi>
                </dd>
              </div>
              <p className="text-meta text-ink-3">
                عايز تغيّر الإيميل أو الرقم؟ ابعتلنا على{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-accent hover:underline">
                  الدعم
                </a>
                .
              </p>
            </dl>
          </div>
        </Panel>

        <Panel title="كلمة السر">
          <div className="max-w-md">
            <PasswordForm />
          </div>
        </Panel>

        <Panel title="خروج">
          <p className="mb-3 text-ui text-ink-2">هتخرج من حسابك على المتصفح ده بس.</p>
          <SignOutButton className="w-fit border border-line-strong px-5" />
        </Panel>

        <Panel title="حذف الحساب" className="border-danger/30">
          <div className="max-w-xl">
            <DeleteAccountForm />
          </div>
        </Panel>
      </div>
    </>
  );
}
