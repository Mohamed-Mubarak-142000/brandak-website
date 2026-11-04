import Image from 'next/image';
import Link from 'next/link';

/** The sign-in pages: one centred card on a light ground, logo on top. */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="bg-sunken px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-window border border-line bg-surface px-5 py-8 shadow-card sm:px-8 sm:py-10">
          <Link href="/" aria-label="فاترينة، الرئيسية" className="mx-auto mb-6 flex w-fit items-center gap-2">
            <Image src="/brand/fatrina-mark.png" alt="" width={44} height={44} className="size-11" />
            <span className="font-sign text-page text-brand">فاترينة</span>
          </Link>
          <h1 className="text-center text-page font-extrabold">{title}</h1>
          {subtitle ? <p className="mt-2 text-center text-ui text-ink-2 sm:text-body">{subtitle}</p> : null}
          <div className="mt-7">{children}</div>
        </div>
        {footer ? <div className="mt-5 text-center text-ui text-ink-2">{footer}</div> : null}
      </div>
    </div>
  );
}
