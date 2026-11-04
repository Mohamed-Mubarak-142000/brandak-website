'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { notifySessionChanged } from '@/components/header/AccountNav';
import { ApiError, auth } from '@/lib/client-api';

import { accountError } from './errors';
import { Alert, PasswordInput, SubmitButton, TextInput } from './fields';
import { latinDigits } from './validation';

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = latinDigits(identifier.trim());
    const errs = { identifier: id ? undefined : 'اكتب الإيميل أو رقم الموبايل', password: password ? undefined : 'اكتب كلمة السر' };
    setErrors(errs);
    if (errs.identifier || errs.password) return;
    setBusy(true);
    setFailure(null);
    try {
      await auth.login(id, password);
      notifySessionChanged();
      router.replace(next);
      router.refresh();
    } catch (err) {
      setFailure(err instanceof ApiError && err.status === 401 ? 'الإيميل أو الرقم أو كلمة السر غلط' : accountError(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {failure ? <Alert title={failure} /> : null}
      <TextInput
        label="الإيميل أو رقم الموبايل"
        value={identifier}
        onChange={setIdentifier}
        error={errors.identifier}
        autoComplete="username"
        inputMode="email"
        placeholder="name@mail.com أو 01012345678"
        autoCapitalize="none"
        spellCheck={false}
        ltr
        autoFocus
      />
      <div className="flex flex-col gap-1">
        <PasswordInput label="كلمة السر" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" placeholder="اكتب كلمة السر" />
        <Link href={`/forgot?next=${encodeURIComponent(next)}`} className="min-h-11 w-fit content-center text-ui font-semibold text-accent hover:underline underline-offset-4">
          نسيت كلمة السر؟
        </Link>
      </div>
      <SubmitButton busy={busy}>{busy ? 'بندخّلك...' : 'تسجيل الدخول'}</SubmitButton>
    </form>
  );
}
