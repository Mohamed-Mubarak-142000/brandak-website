'use client';

import { CircleCheck, X } from 'lucide-react';
import Link from 'next/link';

import { setPurchase, usePurchaseState } from './purchase';

/** "اتضاف للسلة" with a link to the cart. Sits above the sticky order bar on phones. */
export function AddedToast({ productId }: { productId: string }) {
  const { added } = usePurchaseState(productId);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
      {added ? (
        <div role="status" className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-panel bg-ink py-2 ps-4 pe-2 text-white shadow-pop">
          <CircleCheck aria-hidden className="size-5 shrink-0 text-success-soft" />
          <span className="flex-1 text-ui font-bold">اتضاف للسلة</span>
          <Link href="/cart" className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-ui font-bold text-ink hover:bg-sunken">
            عرض السلة
          </Link>
          <button type="button" aria-label="اقفل" onClick={() => setPurchase(productId, { added: false })} className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-white/10">
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
