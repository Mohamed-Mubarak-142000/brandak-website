import { CloudOff } from 'lucide-react';

/** The heading at the top of each account page. */
export function PageTitle({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-page font-extrabold">{title}</h1>
        {body ? <p className="mt-1 text-ui text-ink-2 sm:text-body">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** A white panel for account sections. */
export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-panel border border-line bg-surface p-4 sm:p-5 ${className ?? ''}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-section font-extrabold">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Shown when the API couldn't be reached from the server render. */
export function LoadError({ what = 'البيانات', retryHref }: { what?: string; retryHref: string }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-panel border border-line bg-surface px-6 py-12 text-center">
      <CloudOff aria-hidden className="size-10 text-ink-3" />
      <p className="mt-3 text-section font-extrabold">معرفناش نجيب {what}</p>
      <p className="mt-1 text-ui text-ink-2">غالباً مشكلة مؤقتة في الاتصال. جرّب تاني بعد لحظة.</p>
      {/* A plain link reloads the server render. */}
      <a href={retryHref} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
        جرّب تاني
      </a>
    </div>
  );
}
