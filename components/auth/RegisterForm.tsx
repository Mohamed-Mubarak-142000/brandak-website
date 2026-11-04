'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { notifySessionChanged } from '@/components/header/AccountNav';
import { api, auth } from '@/lib/client-api';

import { accountError, invalidFields } from './errors';
import { Alert, PasswordHints, PasswordInput, SubmitButton, TextInput } from './fields';
import { cleanPhone, emailError, passwordError, phoneError } from './validation';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password', string | null>>;

const FIELD_MESSAGE: Record<string, string> = {
  name: 'الاسم من حرفين لـ 100 حرف',
  email: 'الإيميل ده مش صحيح',
  phone: 'اكتب رقم موبايل مصري صحيح',
  password: '8 حروف على الأقل، فيها حرف إنجليزي ورقم',
};

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const errs: Errors = {
      name: n.length < 2 ? 'اكتب اسمك (حرفين على الأقل)' : n.length > 100 ? 'الاسم طويل أوي' : null,
      email: emailError(email),
      phone: phoneError(phone),
      password: passwordError(password),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setBusy(true);
    setFailure(null);
    try {
      await auth.register({ name: n, email: email.trim().toLowerCase(), phone: cleanPhone(phone.trim()), password });
    } catch (err) {
      const fields = invalidFields(err).filter((f) => f in FIELD_MESSAGE);
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f, FIELD_MESSAGE[f]])));
      setFailure(accountError(err));
      setBusy(false);
      return;
    }
    notifySessionChanged();
    // The account exists now; the code is a nice-to-have, so a failed send doesn't block.
    const sent = await api.post('auth/verify-contact/request', { channel: 'email' }).then(
      () => true,
      () => false,
    );
    router.replace(`/verify?next=${encodeURIComponent(next)}&welcome=1${sent ? '&sent=1' : ''}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {failure ? <Alert title={failure} /> : null}
      <TextInput label="الاسم" value={name} onChange={setName} error={errors.name} autoComplete="name" placeholder="مثال: محمد أحمد" maxLength={100} autoFocus />
      <TextInput
        label="الإيميل"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="name@mail.com"
        hint="هنبعتلك عليه كود تأكيد"
        ltr
      />
      <TextInput
        label="رقم الموبايل"
        type="tel"
        value={phone}
        onChange={setPhone}
        error={errors.phone}
        autoComplete="tel-national"
        inputMode="tel"
        placeholder="01012345678"
        hint="المندوب هيكلمك عليه وقت التوصيل"
        ltr
      />
      <div className="flex flex-col gap-2">
        <PasswordInput label="كلمة السر" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" placeholder="8 حروف على الأقل، فيها حرف ورقم" />
        <PasswordHints value={password} />
      </div>
      <p className="text-meta text-ink-3">
        لما تعمل الحساب تبقى موافق على{' '}
        <Link href="/terms" className="font-semibold text-accent hover:underline underline-offset-4">
          الشروط والأحكام
        </Link>{' '}
        و
        <Link href="/privacy" className="font-semibold text-accent hover:underline underline-offset-4">
          سياسة الخصوصية
        </Link>{' '}
        بتوع فاترينة.
      </p>
      <SubmitButton busy={busy}>{busy ? 'بنعمل حسابك...' : 'اعمل الحساب'}</SubmitButton>
    </form>
  );
}
