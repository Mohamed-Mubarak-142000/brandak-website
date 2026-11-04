'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Container } from '@/components/Container';

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center py-14 text-center sm:py-20">
      <h1 className="font-sign text-page sm:text-display">حصلت مشكلة وإحنا بنجهّز الصفحة</h1>
      <p className="mt-2 max-w-md text-ink-2">غالباً مشكلة مؤقتة في الاتصال بفاترينة. جرّب تاني بعد لحظة، ولو فضلت كده ارجع للرئيسية.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover"
        >
          جرّب تاني
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand">
          الرئيسية
        </Link>
      </div>
    </Container>
  );
}
