import type { Metadata } from 'next';

import { LoadError, PageTitle } from '@/components/account/PageTitle';
import { AssistantPreview } from '@/components/seller/assistant/AssistantPreview';
import { AssistantSettingsForm } from '@/components/seller/assistant/AssistantSettingsForm';
import { Inbox } from '@/components/seller/assistant/Inbox';
import { StatsCards } from '@/components/seller/assistant/StatsCards';
import type { AssistantConversationItem, AssistantSettings, AssistantStats } from '@/components/seller/assistant/types';
import { requestTime } from '@/components/seller/assistant/time';
import { getMyBrand } from '@/components/seller/data';
import { authed, requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'مساعد المتجر',
  robots: { index: false, follow: false },
};

export default async function AssistantPage() {
  const { token } = await requireSeller('/seller/assistant');
  const [settings, stats, convos, brand] = await Promise.all([
    authed<AssistantSettings>('brand/assistant/settings', token),
    authed<AssistantStats>('brand/assistant/stats', token),
    authed<AssistantConversationItem[]>('brand/assistant/conversations', token, { search: '?limit=20&page=1' }),
    getMyBrand(),
  ]);
  // Rendered once per request on the server; the list's "من ٥ دقايق" is relative to it.
  const now = requestTime();

  return (
    <>
      <PageTitle title="مساعد المتجر" body="مساعد ذكي بيرد على أسئلة عملائك في صفحة متجرك على مدار اليوم، من بيانات منتجاتك والمعلومات اللي بتكتبها هنا." />
      {settings.ok && settings.data ? (
        <div className="flex flex-col gap-5">
          {stats.ok && stats.data ? <StatsCards stats={stats.data} /> : null}
          <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
            <AssistantSettingsForm initial={settings.data} />
            {brand ? <AssistantPreview slug={brand.slug} name={settings.data.displayName} enabled={settings.data.enabled && settings.data.available} /> : null}
          </div>
          {convos.ok && convos.data ? (
            <Inbox initial={convos.data} total={Number(convos.meta?.total ?? convos.data.length)} now={now} />
          ) : (
            <LoadError what="المحادثات" retryHref="/seller/assistant" />
          )}
        </div>
      ) : (
        <LoadError what="إعدادات المساعد" retryHref="/seller/assistant" />
      )}
    </>
  );
}
