import { CircleHelp, MessageCircle, Zap } from 'lucide-react';

import { cn } from '@/lib/cn';
import { num } from '@/lib/format';

import type { AssistantStats } from './types';

export function StatsCards({ stats }: { stats: AssistantStats }) {
  const { used, limit } = stats.today;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      <li className="rounded-panel border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-ui text-ink-2">
          <Zap aria-hidden className="size-4 text-accent" />
          ردود النهارده
        </p>
        <p className="mt-1 text-page font-extrabold">
          {num(used)}
          <span className="text-ui font-bold text-ink-3"> / {num(limit)}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="المستخدم من ردود النهارده" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit}>
          <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-brand')} style={{ width: `${pct}%` }} />
        </div>
      </li>
      <li className="rounded-panel border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-ui text-ink-2">
          <MessageCircle aria-hidden className="size-4 text-accent" />
          محادثات آخر 7 أيام
        </p>
        <p className="mt-1 text-page font-extrabold">{num(stats.conversations7d)}</p>
      </li>
      <li className={cn('rounded-panel border bg-surface p-4', stats.unanswered7d ? 'border-warning/30' : 'border-line')}>
        <p className="flex items-center gap-2 text-ui text-ink-2">
          <CircleHelp aria-hidden className="size-4 text-warning" />
          ماعرفش يجاوب (7 أيام)
        </p>
        <p className={cn('mt-1 text-page font-extrabold', stats.unanswered7d ? 'text-warning' : '')}>{num(stats.unanswered7d)}</p>
      </li>
    </ul>
  );
}
