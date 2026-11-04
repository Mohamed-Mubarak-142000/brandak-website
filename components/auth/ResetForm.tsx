'use client';

import Link from 'next/link';
import { useState } from 'react';

import { api } from '@/lib/client-api';

import { accountError } from './errors';
import { Alert, btn, OtpInput, PasswordHints, PasswordInput, SubmitButton, useCooldown } from './fields';
import { passwordError } from './validation';

export function ResetForm({ identifier, next }: { identifier: string; next: string }) {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ code?: string | null; password?: string | null }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const cooldown = useCooldown(60);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { code: code.length < 6 ? 'اكتب الكود كامل (6 أرقام)' : null, password: passwordError(password) };
    setErrors(errs);
    if (errs.code || errs.password) return;
    setBusy(true);
    setFailure(null);
    try {
      await api.post('auth/reset-password', { identifier, code, newPassword: password });
      setDone(true);
    } catch (err) {
      setFailure(accountError(err));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setSending(true);
    setFailure(null);
    try {
      await api.post('auth/forgot-password', { identifier });
      cooldown.start(60);
    } catch (err) {
      setFailure(accountError(err));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="success" title="اتغيرت كلمة السر">
          سجّل دخول بكلمة السر الجديدة. خرّجناك من كل الأجهزة التانية للأمان.
        </Alert>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={btn.primary}>
          سجّل دخول
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {failure ? <Alert title={failure} /> : null}
      <div className="flex flex-col gap-2">
        <OtpInput value={code} onChange={setCode} error={!!errors.code} disabled={busy} label="كود إعادة كلمة السر" autoFocus />
        {errors.code ? (
          <p role="alert" className="text-center text-meta font-semibold text-danger">
            {errors.code}
          </p>
        ) : null}
        <div className="text-center text-ui" aria-live="polite">
          {cooldown.left > 0 ? (
            <p className="text-ink-3">تقدر تطلب كود جديد بعد {cooldown.left} ثانية</p>
          ) : (
            <button type="button" onClick={() => void resend()} disabled={sending} className={btn.quiet}>
              {sending ? 'بنبعت...' : 'ابعت الكود تاني'}
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <PasswordInput label="كلمة السر الجديدة" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" placeholder="اختار كلمة سر قوية" />
        <PasswordHints value={password} />
      </div>
      <SubmitButton busy={busy}>{busy ? 'بنحفظ...' : 'احفظ كلمة السر'}</SubmitButton>
    </form>
  );
}
