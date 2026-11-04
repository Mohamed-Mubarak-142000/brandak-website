import clsx from 'clsx';
import Link from 'next/link';

/** A row of sort options as links (works without JS); the current one is marked. */
export function SortLinks({ options, current, hrefFor, label = 'رتّب حسب' }: { options: { value: string; label: string }[]; current: string; hrefFor: (value: string) => string; label?: string }) {
  return (
    <nav aria-label={label} className="rail -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <span className="shrink-0 text-meta text-ink-3">{label}:</span>
      {options.map((o) => {
        const active = o.value === current;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            aria-current={active ? 'true' : undefined}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-ui font-semibold transition-colors',
              active ? 'border-ink bg-ink text-ground' : 'border-line-strong bg-surface text-ink-2 hover:border-brand hover:text-ink',
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
