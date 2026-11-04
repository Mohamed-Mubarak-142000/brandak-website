'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { api } from '@/lib/client-api';

import { accountError } from './errors';
import { Alert, SubmitButton, TextInput } from './fields';
import { latinDigits } from './validation';

export function ForgotForm({ next }: { next: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = latinDigits(identifier.trim());
    if (!id) return setError('اكتب الإيميل أو رقم الموبايل');
    setError(null);
    setFailure(null);
    setBusy(true);
    try {
      // The API answers OK whether or not the account exists, so we always move on.
      await api.post('auth/forgot-password', { identifier: id });
      router.push(`/reset?identifier=${encodeURIComponent(id)}&next=${encodeURIComponent(next)}`);
    } catch (err) {
      setFailure(accountError(err));
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
        error={error}
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="name@mail.com أو 01012345678"
        ltr
        autoFocus
      />
      <SubmitButton busy={busy}>{busy ? 'بنبعت...' : 'ابعتلي الكود'}</SubmitButton>
    </form>
  );
}
