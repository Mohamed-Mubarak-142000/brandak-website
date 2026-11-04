'use client';

import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import { Container } from '@/components/Container';

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-window border border-line bg-surface px-5 py-10 text-center shadow-card sm:px-10 sm:py-14">
        <Image src="/illustrations/box.png" alt="" width={640} height={640} sizes="176px" className="h-auto w-36 sm:w-44" />
        <h1 className="mt-4 text-page font-extrabold sm:text-display">حصلت مشكلة وإحنا بنجهّز الصفحة</h1>
        <p className="mt-2 max-w-md text-ink-2">غالباً مشكلة مؤقتة في الاتصال بفاترينة. جرّب تاني بعد لحظة، ولو فضلت كده ارجع للرئيسية أو دوّر على اللي عايزه.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover"
          >
            <RefreshCw aria-hidden className="size-4" />
            جرّب تاني
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full border border-line-strong bg-surface px-6 font-bold transition-colors hover:border-brand"
          >
            الرئيسية
          </Link>
        </div>
        <form action="/search" role="search" className="mt-8 w-full max-w-lg">
          <label className="block">
            <span className="sr-only">ابحث عن منتج أو متجر</span>
            <input
              name="q"
              type="search"
              placeholder="ابحث عن منتج، متجر، أو قسم..."
              className="h-12 w-full rounded-full border border-line-strong bg-surface px-5 text-ui placeholder:text-ink-3 focus:border-brand focus:outline-none"
            />
          </label>
        </form>
        <p className="mt-6 text-ui text-ink-3">
          المشكلة مستمرة؟{' '}
          <Link href="/contact" className="font-bold text-accent underline-offset-4 hover:underline">
            قولّنا
          </Link>
        </p>
      </div>
    </Container>
  );
}
