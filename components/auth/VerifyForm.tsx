'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { notifySessionChanged } from '@/components/header/AccountNav';
import { api, ApiError } from '@/lib/client-api';

import { accountError } from './errors';
import { Alert, btn, OtpInput, SubmitButton, useCooldown } from './fields';

const COOLDOWN = 60;

/** Confirms the email with the 6-digit code. `sent` = sign-up already sent one. */
export function VerifyForm({ next, sent, welcome }: { next: string; sent: boolean; welcome: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const cooldown = useCooldown(sent ? COOLDOWN : 0);
  const asked = useRef(sent);
  const tried = useRef('');

  const done = () => {
    notifySessionChanged();
    router.replace(next);
    router.refresh();
  };

  const request = async () => {
    setSending(true);
    setError(null);
    try {
      await api.post('auth/verify-contact/request', { channel: 'email' });
      cooldown.start(COOLDOWN);
      setNotice('بعتنا كود جديد على إيميلك.');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'ALREADY_VERIFIED') return done();
      setError(accountError(e));
    } finally {
      setSending(false);
    }
  };

  const verify = async (c: string) => {
    if (busy) return;
    tried.current = c;
    setBusy(true);
    setError(null);
    try {
      await api.post('auth/verify-contact', { channel: 'email', code: c });
      done();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'ALREADY_VERIFIED') return done();
      setError(accountError(e));
      setCode('');
      setBusy(false);
    }
  };

  // Coming from the account banner: send a code once on arrival.
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    const t = setTimeout(() => void request(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The sixth digit submits by itself (once per code).
  const change = (v: string) => {
    setCode(v);
    if (v.length === 6 && v !== tried.current) void verify(v);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) void verify(code);
        else setError('اكتب الكود كامل (6 أرقام)');
      }}
      className="flex flex-col gap-5"
    >
      <OtpInput value={code} onChange={change} error={!!error} disabled={busy} label="كود التأكيد" autoFocus />
      {error ? <Alert title={error} /> : notice ? <Alert tone="success" title={notice} /> : null}
      <SubmitButton busy={busy} disabled={code.length < 6}>
        {busy ? 'بنأكّد...' : 'تأكيد'}
      </SubmitButton>
      <div className="text-center text-ui" aria-live="polite">
        {cooldown.left > 0 ? (
          <p className="text-ink-3">تقدر تطلب كود جديد بعد {cooldown.left} ثانية</p>
        ) : (
          <button type="button" onClick={() => void request()} disabled={sending} className={btn.quiet}>
            {sending ? 'بنبعت...' : 'ابعت الكود تاني'}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          router.replace(next);
        }}
        className="mx-auto min-h-11 cursor-pointer px-3 text-ui font-semibold text-ink-2 hover:text-ink"
      >
        {welcome ? 'هأكّد بعدين' : 'مش دلوقتي'}
      </button>
    </form>
  );
}
