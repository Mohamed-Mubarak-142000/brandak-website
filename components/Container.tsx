import clsx from 'clsx';

/** The page column: 16px gutters on phones, 1152px max. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}
