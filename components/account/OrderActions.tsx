'use client';

import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { accountError } from '@/components/auth/errors';
import { Alert, btn, OtpInput, SubmitButton, useCooldown } from '@/components/auth/fields';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { OrderDetail } from '@/lib/types';

import { Dialog } from './Dialog';

const REASONS = ['غيّرت رأيي', 'طلبت بالغلط', 'لقيته بسعر أقل', 'التوصيل هياخد وقت طويل'];

/** "إلغاء الطلب" with a confirm dialog and an optional reason. */
export function CancelOrder({ orderId, className }: { orderId: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post<OrderDetail>(`orders/me/${orderId}/cancel`, { reason: reason.trim() || undefined });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(accountError(e));
    } finally {
      setBusy(false);
    }
  };

  const custom = REASONS.includes(reason) ? '' : reason;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(btn.secondary, 'text-danger hover:border-danger hover:text-danger', className)}>
        إلغاء الطلب
      </button>
      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="تلغي الطلب؟"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className={btn.secondary}>
              لا، خليه
            </button>
            <button type="button" onClick={() => void cancel()} disabled={busy} aria-busy={busy || undefined} className={btn.danger}>
              {busy ? 'بنلغي...' : 'أيوه، ألغي الطلب'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">قولنا السبب عشان نحسّن التجربة (اختياري):</p>
        <div role="group" aria-label="سبب الإلغاء" className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              onClick={() => setReason(reason === r ? '' : r)}
              className={cn(
                'min-h-11 cursor-pointer rounded-full border px-4 text-ui font-semibold transition-colors',
                reason === r ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-ink-2 hover:border-brand',
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-ui font-semibold">
            سبب تاني <span className="font-normal text-ink-3">(اختياري)</span>
          </span>
          <textarea
            value={custom}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="اكتب السبب باختصار"
            className="w-full rounded-card border border-line-strong px-3.5 py-2.5 text-body placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
        </label>
        {error ? <Alert title={error} /> : null}
      </Dialog>
    </>
  );
}

/**
 * New customers confirm a cash order with a code sent to their email. One code confirms every
 * order they're holding, from any store.
 */
export function ConfirmOrderBox({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const cooldown = useCooldown(0);

  const confirm = async (c: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const orders = await api.post<OrderDetail[]>('orders/me/confirm', { code: c });
      setNotice(orders.length > 1 ? `اتأكد ${orders.length} طلبات واتبعتوا للمتاجر` : 'اتأكد طلبك واتبعت للمتجر');
      router.refresh();
    } catch (e) {
      setError(accountError(e));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setSending(true);
    setError(null);
    try {
      await api.post('orders/me/confirm/resend');
      cooldown.start(60);
      setNotice('بعتنا كود جديد على إيميلك.');
    } catch (e) {
      setError(accountError(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="confirm-title" className="rounded-panel border border-warning/25 bg-warning-soft p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-warning" />
        <div className="min-w-0">
          <h2 id="confirm-title" className="text-section font-extrabold text-ink">
            طلبك مستني تأكيدك
          </h2>
          <p className="mt-1 text-ui text-ink-2">
            بعتنا كود من 6 أرقام على{' '}
            <bdi dir="ltr" className="font-semibold text-ink">
              {email}
            </bdi>
            . أكّده عشان الطلب يوصل للمتجر، وإلا هيتلغي لوحده بعد 24 ساعة.
          </p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void confirm(code);
          else setError('اكتب الكود كامل (6 أرقام)');
        }}
        className="mt-4 flex flex-col gap-4 rounded-card bg-surface p-4"
      >
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            if (v.length === 6) void confirm(v);
          }}
          error={!!error}
          disabled={busy}
          label="كود تأكيد الطلب"
        />
        {error ? <Alert title={error} /> : notice ? <Alert tone="success" title={notice} /> : null}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <SubmitButton busy={busy} disabled={code.length < 6} className="w-full sm:w-auto">
            {busy ? 'بنأكّد...' : 'أكّد الطلب'}
          </SubmitButton>
          <div aria-live="polite" className="text-ui">
            {cooldown.left > 0 ? (
              <p className="text-ink-3">تقدر تطلب كود جديد بعد {cooldown.left} ثانية</p>
            ) : (
              <button type="button" onClick={() => void resend()} disabled={sending} className={btn.quiet}>
                {sending ? 'بنبعت...' : 'مجالكش الكود؟ ابعته تاني'}
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
