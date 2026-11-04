'use client';

import { Ban, CircleCheck, PackageCheck, Truck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Dialog } from '@/components/account/Dialog';
import { Alert, btn, TextInput } from '@/components/auth/fields';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { OrderStatus } from '@/lib/types';

import { ChoiceChip } from '../bits';
import { sellerError } from '../errors';

const NEXT: Partial<Record<OrderStatus, { label: string; icon: typeof Truck }>> = {
  CONFIRMED: { label: 'تأكيد الطلب', icon: CircleCheck },
  PROCESSING: { label: 'بدء التجهيز', icon: PackageCheck },
  SHIPPED: { label: 'تم الشحن', icon: Truck },
  DELIVERED: { label: 'تم التوصيل', icon: CircleCheck },
};
const CARRIERS = ['بوسطة', 'أرامكس', 'J&T', 'مايلرز', 'البريد المصري', 'مندوب المتجر'];
const CANCEL_REASONS = ['المنتج خلص', 'العميل مش بيرد', 'العنوان خارج التغطية', 'طلب مكرر'];

type Body = { status: OrderStatus; note?: string; shipment?: { carrier: string; trackingNumber: string; trackingUrl?: string } };
type Open = null | 'ship' | 'cancel' | 'refuse' | 'block';

/**
 * The next step from `allowedNextStatuses`, plus cancel / refused / block. Nothing is optimistic:
 * after each call the page is fetched again (router.refresh).
 */
export function OrderActions({ orderId, allowed, pickup }: { orderId: string; allowed: OrderStatus[]; pickup: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState<Open>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [reason, setReason] = useState('');

  const next = allowed.find((s) => s !== 'CANCELLED' && s !== 'REFUSED');
  const canCancel = allowed.includes('CANCELLED');
  const canRefuse = allowed.includes('REFUSED');

  const run = async (call: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await call();
      setOpen(null);
      setNotice(done);
      router.refresh();
    } catch (e) {
      setError(sellerError(e));
    } finally {
      setBusy(false);
    }
  };
  const move = (body: Body, done: string) => run(() => api.patch(`brand/orders/${orderId}/status`, body), done);

  const close = () => {
    if (!busy) {
      setOpen(null);
      setError(null);
    }
  };
  const nextInfo = next ? NEXT[next] : undefined;
  const NextIcon = nextInfo?.icon;
  const urlOk = !trackingUrl.trim() || /^https?:\/\/\S+$/.test(trackingUrl.trim());

  return (
    <div className="flex flex-col gap-3">
      {notice ? <Alert tone="success" title={notice} /> : null}
      {error && !open ? <Alert title={error} /> : null}

      {next && nextInfo && NextIcon ? (
        <button
          type="button"
          disabled={busy}
          aria-busy={busy || undefined}
          className={cn(btn.primary, 'w-full')}
          // Shipping asks for the tracking number so the customer can follow the parcel; pickup
          // orders have nothing to ship ("ready" tells the customer to come).
          onClick={() => (next === 'SHIPPED' && !pickup ? setOpen('ship') : move({ status: next }, 'اتحدّثت حالة الطلب'))}
        >
          <NextIcon aria-hidden className="size-5" />
          {next === 'SHIPPED' && pickup ? 'جاهز للاستلام' : nextInfo.label}
        </button>
      ) : null}
      {canRefuse ? (
        <button type="button" disabled={busy} className={cn(btn.secondary, 'w-full')} onClick={() => setOpen('refuse')}>
          العميل رفض الاستلام
        </button>
      ) : null}
      {canCancel ? (
        <button type="button" disabled={busy} className={cn(btn.quiet, 'justify-center text-danger')} onClick={() => setOpen('cancel')}>
          <X aria-hidden className="size-4" />
          إلغاء الطلب
        </button>
      ) : null}
      <button type="button" disabled={busy} className={cn(btn.quiet, 'justify-center text-ink-3')} onClick={() => setOpen('block')}>
        <Ban aria-hidden className="size-4" />
        حظر العميل
      </button>

      <Dialog
        open={open === 'ship'}
        onClose={close}
        title="شحن الطلب"
        footer={
          <>
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => move({ status: 'SHIPPED' }, 'الطلب في الطريق')}>
              من غير رقم شحنة
            </button>
            <button
              type="button"
              className={btn.primary}
              disabled={busy || carrier.trim().length < 2 || tracking.trim().length < 3 || !urlOk}
              onClick={() =>
                move(
                  { status: 'SHIPPED', shipment: { carrier: carrier.trim(), trackingNumber: tracking.trim(), trackingUrl: trackingUrl.trim() || undefined } },
                  'الطلب في الطريق',
                )
              }
            >
              <Truck aria-hidden className="size-5" />
              {busy ? 'بنحفظ...' : 'تم الشحن'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">رقم الشحنة بيظهر للعميل عشان يتابع طلبه.</p>
        {error ? <Alert title={error} /> : null}
        <div className="flex flex-wrap gap-2">
          {CARRIERS.map((c) => (
            <ChoiceChip key={c} selected={carrier === c} onClick={() => setCarrier(c)}>
              {c}
            </ChoiceChip>
          ))}
        </div>
        <TextInput label="شركة الشحن" value={carrier} onChange={setCarrier} maxLength={40} />
        <TextInput label="رقم الشحنة" value={tracking} onChange={setTracking} maxLength={60} ltr />
        <TextInput
          label="لينك التتبع"
          optional
          value={trackingUrl}
          onChange={setTrackingUrl}
          type="url"
          ltr
          placeholder="https://"
          maxLength={500}
          error={urlOk ? null : 'اللينك لازم يبدأ بـ https://'}
        />
      </Dialog>

      <Dialog
        open={open === 'cancel'}
        onClose={close}
        title="إلغاء الطلب"
        footer={
          <>
            <button type="button" className={btn.secondary} disabled={busy} onClick={close}>
              رجوع
            </button>
            <button type="button" className={btn.danger} disabled={busy || reason.trim().length < 3} onClick={() => move({ status: 'CANCELLED', note: reason.trim() }, 'اتلغى الطلب')}>
              {busy ? 'بنلغي...' : 'تأكيد الإلغاء'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">السبب هيظهر للعميل، والمخزون هيرجع تلقائياً.</p>
        {error ? <Alert title={error} /> : null}
        <div className="flex flex-wrap gap-2">
          {CANCEL_REASONS.map((r) => (
            <ChoiceChip key={r} selected={reason === r} onClick={() => setReason(r)}>
              {r}
            </ChoiceChip>
          ))}
        </div>
        <TextInput label="سبب الإلغاء" value={reason} onChange={setReason} maxLength={300} placeholder="اكتب السبب اللي هيظهر للعميل" hint="3 حروف على الأقل" />
      </Dialog>

      <Dialog
        open={open === 'refuse'}
        onClose={close}
        title="العميل رفض الاستلام؟"
        footer={
          <>
            <button type="button" className={btn.secondary} disabled={busy} onClick={close}>
              رجوع
            </button>
            <button type="button" className={btn.danger} disabled={busy} onClick={() => move({ status: 'REFUSED' }, 'اتسجل إن العميل رفض الاستلام')}>
              {busy ? 'بنحفظ...' : 'أيوه، رفض'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">المخزون هيرجع، ومفيش عمولة على الطلب ده، وده هيتسجل في سجل العميل.</p>
        {error ? <Alert title={error} /> : null}
      </Dialog>

      <Dialog
        open={open === 'block'}
        onClose={close}
        title="حظر العميل ده؟"
        footer={
          <>
            <button type="button" className={btn.secondary} disabled={busy} onClick={close}>
              رجوع
            </button>
            <button
              type="button"
              className={btn.danger}
              disabled={busy}
              onClick={() => run(() => api.post(`brand/orders/${orderId}/block-customer`, { note: 'من صفحة الطلب على الموقع' }), 'العميل ده مش هيقدر يطلب من متجرك تاني')}
            >
              {busy ? 'بنحظر...' : 'حظر'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">مش هيقدر يطلب من متجرك تاني. تقدر تلغي الحظر من التطبيق (إعدادات المتجر › العملاء المحظورين).</p>
        {error ? <Alert title={error} /> : null}
      </Dialog>
    </div>
  );
}
