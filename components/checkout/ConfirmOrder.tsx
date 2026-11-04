'use client';

import { CircleAlert, Loader2, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api } from '@/lib/client-api';
import { num, price } from '@/lib/format';
import type { OrderDetail } from '@/lib/types';

import { isCode, latinDigits, shopError } from './errors';

const COOLDOWN = 60;

/**
 * New customers (and those who refused parcels before) confirm a cash order with a 6-digit code
 * sent to their email. One code confirms every order they're holding, from any store.
 */
export function ConfirmOrder({ order, email }: { order: OrderDetail; email: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(COOLDOWN);
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const done = `/checkout/${order.brand.id}/done?order=${order.id}`;

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const confirm = async (c: string) => {
    if (busy || c.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      await api.post<OrderDetail[]>('orders/me/confirm', { code: c });
      router.replace(done);
    } catch (e) {
      // Confirmed already (another tab, or the app): just move on.
      if (isCode(e, 'NOTHING_TO_CONFIRM')) return router.replace(done);
      setError(shopError(e, 'الكود غلط أو انتهى. اطلب كود جديد.'));
      setCode('');
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    try {
      await api.post('orders/me/confirm/resend');
      setLeft(COOLDOWN);
      setSent(true);
    } catch (e) {
      setError(shopError(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <section aria-labelledby="confirm-title" className="mx-auto max-w-lg rounded-panel border border-line bg-surface p-5 text-center shadow-card sm:p-8">
      <MailCheck aria-hidden className="mx-auto size-12 text-accent" />
      <h2 id="confirm-title" className="mt-3 text-section font-extrabold">
        خطوة واحدة وطلبك يوصل للمتجر
      </h2>
      <p className="mt-2 text-ui text-ink-2">
        بعتنا كود من ٦ أرقام على <bdi className="font-bold text-ink">{email}</bdi>. ده بيحمي المتاجر من الطلبات الوهمية، وبيتطلب بس في أول طلب ليك.
      </p>
      <p className="mt-2 text-meta text-ink-3">
        طلب رقم <bdi dir="ltr">#{order.orderNumber}</bdi> · {num(order.itemsCount)} منتج · {price(order.grandTotal)}
      </p>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          void confirm(code);
        }}
      >
        <label htmlFor="order-code" className="sr-only">
          كود التأكيد
        </label>
        <input
          id="order-code"
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          disabled={busy}
          onChange={(e) => {
            const v = latinDigits(e.target.value).replace(/\D/g, '').slice(0, 6);
            setCode(v);
            setError(null);
            if (v.length === 6) void confirm(v);
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? 'code-error' : undefined}
          placeholder="••••••"
          className="mx-auto block w-full max-w-64 rounded-card border border-line-strong bg-surface py-3 text-center text-page font-extrabold tracking-[0.5em] outline-none focus:border-brand aria-invalid:border-danger"
        />
        {error ? (
          <p id="code-error" role="alert" className="mt-3 flex items-center justify-center gap-1.5 text-ui font-semibold text-danger">
            <CircleAlert aria-hidden className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || code.length < 6}
          className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-3"
        >
          {busy ? <Loader2 aria-hidden className="size-5 animate-spin" /> : null}
          أكّد الطلب
        </button>
      </form>

      <div className="mt-4 min-h-11 text-ui" aria-live="polite">
        {left > 0 ? (
          <p className="py-2.5 text-ink-3">{sent ? 'بعتنا كود جديد. ' : ''}تقدر تطلب كود جديد بعد {num(left)} ثانية</p>
        ) : (
          <button type="button" onClick={resend} disabled={resending} className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-bold text-accent hover:underline disabled:cursor-wait">
            {resending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            ابعت الكود تاني
          </button>
        )}
      </div>
      <p className="mt-2 text-meta text-ink-3">مش لاقي الإيميل؟ بص في الـ Spam. لو متأكدش خلال ٢٤ ساعة، الطلب بيتلغي لوحده.</p>
    </section>
  );
}
