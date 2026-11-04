import Link from 'next/link';

/** Section title with an optional "see all" link on the far side. */
export function SectionHeader({ title, body, href, linkLabel = 'شوف الكل', as: Tag = 'h2' }: { title: string; body?: string; href?: string; linkLabel?: string; as?: 'h1' | 'h2' }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <Tag className={Tag === 'h1' ? 'text-page font-extrabold sm:text-display sm:font-sign sm:font-normal' : 'text-section font-extrabold sm:text-page'}>{title}</Tag>
        {body ? <p className="mt-1 max-w-2xl text-ui text-ink-2 sm:text-body">{body}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-ui font-bold text-accent underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
