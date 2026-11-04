'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { btn } from '@/components/auth/fields';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';

import { sellerError } from './errors';

/** A rejected store sends itself back for review (POST brands/me/resubmit). */
export function ResubmitButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={busy}
        aria-busy={busy || undefined}
        className={cn(btn.primary, 'min-h-11', className)}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await api.post('brands/me/resubmit');
            router.refresh();
          } catch (e) {
            setError(sellerError(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'بنبعت...' : 'ابعت للمراجعة تاني'}
      </button>
      {error ? (
        <p role="alert" className="text-meta font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
