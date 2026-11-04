'use client';

import { TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { accountError, invalidFields } from '@/components/auth/errors';
import { Alert, btn, PasswordHints, PasswordInput, SubmitButton, TextInput } from '@/components/auth/fields';
import { passwordError } from '@/components/auth/validation';
import { notifySessionChanged } from '@/components/header/AccountNav';
import { api, ApiError, auth } from '@/lib/client-api';
import type { Me } from '@/lib/types';

import { Dialog } from './Dialog';

/** The API lets a customer change only the name (UpdateMeDto); email and phone are shown read-only. */
export function ProfileForm({ name: initialName }: { name: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2 || n.length > 100) return setError('الاسم من حرفين لـ 100 حرف');
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const me = await api.patch<Me>('users/me', { name: n });
      setSaved(me.name);
      setName(me.name);
      setNotice('اتحفظ اسمك.');
      notifySessionChanged();
      router.refresh();
    } catch (err) {
      setError(invalidFields(err).includes('name') ? 'الاسم من حرفين لـ 100 حرف' : accountError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextInput label="الاسم" value={name} onChange={setName} error={error} autoComplete="name" maxLength={100} />
      {notice ? <Alert tone="success" title={notice} /> : null}
      <SubmitButton busy={busy} disabled={name.trim() === saved} className="self-start">
        {busy ? 'بنحفظ...' : 'احفظ الاسم'}
      </SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [errors, setErrors] = useState<{ current?: string | null; next?: string | null }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { current: current ? null : 'اكتب كلمة السر الحالية', next: passwordError(next) ?? (next === current ? 'اختار كلمة سر مختلفة عن الحالية' : null) };
    setErrors(errs);
    if (errs.current || errs.next) return;
    setBusy(true);
    setFailure(null);
    setNotice(null);
    try {
      await api.post('auth/change-password', { currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      setNotice('اتغيرت كلمة السر. خرّجناك من الأجهزة التانية، والجهاز ده لسه مسجّل.');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'WRONG_PASSWORD') setErrors({ current: 'كلمة السر الحالية غلط' });
      else setFailure(accountError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {failure ? <Alert title={failure} /> : null}
      <PasswordInput label="كلمة السر الحالية" value={current} onChange={setCurrent} error={errors.current} autoComplete="current-password" />
      <div className="flex flex-col gap-2">
        <PasswordInput label="كلمة السر الجديدة" value={next} onChange={setNext} error={errors.next} autoComplete="new-password" placeholder="اختار كلمة سر قوية" />
        <PasswordHints value={next} />
      </div>
      {notice ? <Alert tone="success" title={notice} /> : null}
      <SubmitButton busy={busy} className="self-start">
        {busy ? 'بنحفظ...' : 'غيّر كلمة السر'}
      </SubmitButton>
    </form>
  );
}

const GONE = ['اسمك وإيميلك ورقم موبايلك وكلمة السر', 'عناوينك وسلتك والمفضلة وتنبيهات الأسعار', 'رصيد نقاطك والمتاجر اللي بتابعها', 'بياناتك الشخصية جوه طلباتك القديمة'];

/** Deletes the account after the password confirms it, then signs this browser out. */
export function DeleteAccountForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post('auth/delete-account', { password });
      // The API already ended every session; clear this browser's cookies too.
      await auth.logout();
      notifySessionChanged();
      router.replace('/');
      router.refresh();
    } catch (err) {
      setOpen(false);
      setError(accountError(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 rounded-card bg-danger-soft p-4 text-danger">
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div className="text-ui">
          <p className="font-bold">الحذف نهائي ومينفعش يرجع</p>
          <p className="mt-1 text-ink-2">اللي هيتمسح:</p>
          <ul className="mt-1 list-disc ps-5 text-ink-2">
            {GONE.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <p className="mt-2 text-meta text-ink-3">المتاجر بتحتفظ بسجل الطلبات (المنتجات والمبالغ) من غير بياناتك، والتقييمات بتفضل باسم «مستخدم محذوف».</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!password) return setError('اكتب كلمة السر عشان نتأكد إنه أنت');
          setError(null);
          setOpen(true);
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <PasswordInput label="كلمة السر للتأكيد" value={password} onChange={setPassword} error={error} autoComplete="current-password" />
        <SubmitButton variant="danger" className="self-start">
          احذف حسابي
        </SubmitButton>
      </form>
      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="تمسح حسابك نهائياً؟"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className={btn.secondary}>
              رجوع
            </button>
            <button type="button" onClick={() => void remove()} disabled={busy} aria-busy={busy || undefined} className={btn.danger}>
              {busy ? 'بنمسح...' : 'أيوه، احذف حسابي'}
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">مش هتقدر ترجّعه تاني، وهتحتاج تعمل حساب جديد لو حبيت ترجع.</p>
      </Dialog>
    </div>
  );
}
