import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

/** Section title, optional one-line description, and a "see all" pill on the far side. */
export function SectionHeader({
  title,
  body,
  href,
  linkLabel = 'شوف الكل',
  as: Tag = 'h2',
}: {
  title: string;
  body?: string;
  href?: string;
  linkLabel?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
      <div className="min-w-0">
        <Tag className={Tag === 'h1' ? 'text-page font-extrabold sm:text-display' : 'text-section font-extrabold sm:text-page'}>{title}</Tag>
        {body ? <p className="mt-1 max-w-2xl text-ui text-ink-2 sm:text-body">{body}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full border border-line px-4 text-ui font-bold text-ink transition-colors hover:border-brand hover:text-accent"
        >
          {linkLabel}
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
