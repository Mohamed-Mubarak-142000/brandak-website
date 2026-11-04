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
    <div className="flex flex-col items-center rounded-panel border border-dashed border-line-strong bg-sunken/60 px-6 py-12 text-center">
      <Image src={`/illustrations/${art}.png`} alt="" width={140} height={140} className="mb-4 h-auto w-32" />
      <h3 className="text-section font-bold">{title}</h3>
      {body ? <p className="mt-1 max-w-md text-ui text-ink-2">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
