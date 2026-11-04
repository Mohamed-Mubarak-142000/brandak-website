import { ChevronRight, Lightbulb, Package, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LoadError, Panel } from '@/components/account/PageTitle';
import { dayOf, timeOf } from '@/components/seller/assistant/time';
import type { AssistantConversation } from '@/components/seller/assistant/types';
import { cn } from '@/lib/cn';
import { authed, requireSeller } from '@/lib/session';

export const metadata: Metadata = {
  title: 'محادثة مع المساعد',
  robots: { index: false, follow: false },
};

export default async function AssistantConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = `/seller/assistant/${encodeURIComponent(id)}`;
  const { token } = await requireSeller(path);
  const res = await authed<AssistantConversation>(`brand/assistant/conversations/${encodeURIComponent(id)}`, token);
  if (res.status === 404 || res.status === 400) notFound();
  const c = res.data;

  const back = (
    <Link href="/seller/assistant" className="mb-4 inline-flex min-h-11 items-center gap-1 text-ui font-bold text-ink-2 hover:text-accent">
      <ChevronRight aria-hidden className="size-4" />
      كل المحادثات
    </Link>
  );
  if (!res.ok || !c)
    return (
      <>
        {back}
        <LoadError what="المحادثة" retryHref={path} />
      </>
    );

  const who = c.customerFirstName || 'زائر';
  const gaps = c.messages.filter((m) => m.role === 'assistant' && m.unanswered).length;
  const days = c.messages.map((m) => dayOf(m.at));

  return (
    <>
      {back}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-surface text-ink-3">
          <UserRound aria-hidden className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-page font-extrabold">{who}</h1>
          <p className="text-ui text-ink-2">
            {c.signedIn ? 'عميل مسجّل' : 'زائر مش مسجّل'} · {c.count} رسالة · بدأت {dayOf(c.createdAt)}
          </p>
        </div>
      </div>

      {c.product ? (
        <Link href={`/seller/products/${c.product.id}`} className="mb-4 flex items-center gap-3 rounded-panel border border-line bg-surface p-3 hover:border-brand">
          <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-card bg-sunken">
            {c.product.imageUrl ? <Image src={c.product.imageUrl} alt="" fill sizes="48px" className="object-cover" /> : <Package aria-hidden className="size-5 text-ink-3" />}
          </span>
          <span className="min-w-0">
            <span className="block text-meta text-ink-3">سأل من صفحة المنتج</span>
            <span className="block truncate font-bold">{c.product.title}</span>
          </span>
        </Link>
      ) : null}

      {gaps ? (
        <div role="note" className="mb-4 flex gap-3 rounded-panel border border-warning/25 bg-warning-soft p-4 text-warning">
          <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0" />
          <p className="text-ui">
            المساعد ماعرفش يجاوب {gaps === 1 ? 'على سؤال' : `على ${gaps} أسئلة`} في المحادثة دي.{' '}
            <Link href="/seller/assistant" className="font-bold underline underline-offset-4">
              ضيف المعلومة في «معلومات إضافية»
            </Link>{' '}
            عشان يعرفها المرة الجاية.
          </p>
        </div>
      ) : null}

      <Panel>
        <ol className="flex flex-col gap-3" aria-label="الرسايل">
          {c.messages.map((m, i) => {
            const day = days[i];
            const showDay = i === 0 || day !== days[i - 1];
            const mine = m.role === 'assistant';
            const unansweredQ = !mine && c.messages[i + 1]?.role === 'assistant' && !!c.messages[i + 1].unanswered;
            return (
              <li key={i} className="flex flex-col gap-1">
                {showDay ? <p className="my-1 self-center rounded-full bg-sunken px-3 py-0.5 text-meta text-ink-3">{day}</p> : null}
                <div className={cn('flex max-w-[88%] flex-col gap-1 sm:max-w-[75%]', mine ? 'self-end items-end' : 'self-start items-start')}>
                  <span className="text-meta text-ink-3">
                    {mine ? 'المساعد' : who} · <time dateTime={m.at}>{timeOf(m.at)}</time>
                  </span>
                  <p
                    className={cn(
                      'whitespace-pre-line rounded-panel px-3.5 py-2.5 text-ui',
                      mine ? 'rounded-se-sm border border-line bg-sunken text-ink' : 'rounded-ss-sm bg-accent text-on-accent',
                      mine && m.unanswered && 'border-warning/40 bg-warning-soft',
                      unansweredQ && 'ring-2 ring-warning/60 ring-offset-2',
                    )}
                  >
                    {m.text}
                  </p>
                  {m.products?.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {m.products.map((p) => (
                        <li key={p.id}>
                          <Link href={`/seller/products/${p.id}`} className="inline-flex min-h-8 items-center rounded-full border border-line bg-surface px-2.5 text-meta hover:border-brand hover:text-accent">
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {mine && m.unanswered ? (
                    <p className="flex items-start gap-1.5 text-meta font-semibold text-warning">
                      <Lightbulb aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                      ضيف المعلومة دي في «معلومات إضافية» عشان المساعد يعرفها المرة الجاية
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </>
  );
}
