import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/Container';
import { SearchForm } from '@/components/Header';

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-14 text-center sm:py-20">
      <Image src="/illustrations/search.png" alt="" width={1254} height={1254} sizes="176px" className="h-auto w-44" />
      <h1 className="mt-4 font-sign text-page sm:text-display">الصفحة دي مش موجودة</h1>
      <p className="mt-2 max-w-md text-ink-2">ممكن اللينك يكون غلط، أو المنتج أو المتجر اتشال. دوّر على اللي كنت عايزه:</p>
      <SearchForm className="mt-6 w-full max-w-md" />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/stores" className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover">
          اتفرّج على المتاجر
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-5 font-bold hover:border-brand">
          الرئيسية
        </Link>
      </div>
    </Container>
  );
}
