import Image from 'next/image';

/** An empty list is an invitation to act: say what's missing and give the next step. */
export function EmptyState({
  title,
  body,
  art = 'empty',
  action,
}: {
  title: string;
  body?: string;
  art?: 'empty' | 'search' | 'store' | 'box' | 'brands';
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-panel border border-line bg-sunken px-6 py-14 text-center">
      <Image src={`/illustrations/${art}.png`} alt="" width={160} height={160} className="mb-5 h-auto w-36" />
      <h3 className="text-section font-extrabold">{title}</h3>
      {body ? <p className="mt-2 max-w-md text-ui text-ink-2 sm:text-body">{body}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
