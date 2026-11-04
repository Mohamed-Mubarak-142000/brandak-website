'use client';

import { useEffect, useId, useState } from 'react';

import { accountError, invalidFields } from '@/components/auth/errors';
import { Alert, btn, Field, inputClass, SubmitButton, TextInput } from '@/components/auth/fields';
import { cleanPhone, nationalPhone, phoneError } from '@/components/auth/validation';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import type { Address, Governorate } from '@/lib/types';

const LABELS = ['البيت', 'الشغل', 'عند الأهل'];

type Values = {
  label: string;
  recipientName: string;
  phone: string;
  governorate: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  isDefault: boolean;
};
type Key = Exclude<keyof Values, 'isDefault'>;

let governoratesCache: Promise<Governorate[]> | null = null;
const loadGovernorates = () => {
  governoratesCache ??= api.get<Governorate[]>('governorates').catch((e) => {
    governoratesCache = null;
    throw e;
  });
  return governoratesCache;
};

/** Checks mirror CreateAddressDto (`brandak backend/src/addresses/addresses.dto.ts`). */
function validate(v: Values): Partial<Record<Key, string>> {
  const e: Partial<Record<Key, string>> = {};
  const name = v.recipientName.trim();
  if (name.length < 2) e.recipientName = 'اكتب اسم المستلم (حرفين على الأقل)';
  const p = phoneError(v.phone);
  if (p) e.phone = p;
  if (!v.governorate) e.governorate = 'اختار المحافظة';
  if (v.city.trim().length < 2) e.city = 'اكتب المدينة أو المركز';
  if (v.street.trim().length < 2) e.street = 'اكتب الشارع ورقم البيت';
  return e;
}

/**
 * Add or edit a delivery address (also used at checkout).
 * - `initial`: the address being edited; leave out to add a new one.
 * - `defaults`: prefill a new address (e.g. the account's name and phone).
 * - `onSaved`: gets the saved address from the API.
 * - `onCancel`: shows a "رجوع" button when given.
 * - `forceDefault`: always save as the default (hides the toggle), e.g. the first address.
 */
export function AddressForm({
  initial,
  defaults,
  onSaved,
  onCancel,
  forceDefault,
}: {
  initial?: Address | null;
  defaults?: { recipientName?: string; phone?: string };
  onSaved: (address: Address) => void;
  onCancel?: () => void;
  forceDefault?: boolean;
}) {
  const [v, setV] = useState<Values>(() => ({
    label: initial?.label ?? 'البيت',
    recipientName: initial?.recipientName ?? defaults?.recipientName ?? '',
    phone: nationalPhone(initial?.phone ?? defaults?.phone),
    governorate: initial?.governorate ?? '',
    city: initial?.city ?? '',
    area: initial?.area ?? '',
    street: initial?.street ?? '',
    building: initial?.building ?? '',
    floor: initial?.floor ?? '',
    apartment: initial?.apartment ?? '',
    landmark: initial?.landmark ?? '',
    isDefault: forceDefault || (initial?.isDefault ?? false),
  }));
  const uid = useId();
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [govs, setGovs] = useState<Governorate[] | null>(null);
  const [govError, setGovError] = useState(false);

  useEffect(() => {
    let live = true;
    loadGovernorates().then(
      (g) => live && setGovs(g),
      () => live && setGovError(true),
    );
    return () => {
      live = false;
    };
  }, []);

  const set = (k: keyof Values) => (x: string | boolean) => {
    setV((s) => ({ ...s, [k]: x }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`${uid}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    setFailure(null);
    const body: Record<string, unknown> = { isDefault: forceDefault || v.isDefault };
    for (const k of Object.keys(v) as (keyof Values)[]) {
      if (k === 'isDefault') continue;
      const x = v[k].trim();
      // Optional fields are sent empty on edit so a cleared value is cleared on the server too.
      if (x || initial) body[k] = x;
    }
    body.phone = cleanPhone(v.phone.trim());
    try {
      const saved = initial ? await api.patch<Address>(`addresses/me/${initial.id}`, body) : await api.post<Address>('addresses/me', body);
      onSaved(saved);
    } catch (err) {
      const fields = invalidFields(err).filter((f): f is Key => f in v && f !== 'isDefault');
      if (fields.length) setErrors(Object.fromEntries(fields.map((f) => [f, 'القيمة دي مش مظبوطة'])));
      setFailure(accountError(err));
      setBusy(false);
    }
  };

  const text = (k: Key, label: string, opts: Partial<React.ComponentProps<typeof TextInput>> = {}) => (
    <TextInput id={`${uid}-${k}`} label={label} value={v[k]} onChange={set(k)} error={errors[k]} {...opts} />
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {failure ? <Alert title={failure} /> : null}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-ui font-semibold">اسم العنوان</legend>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={v.label === l}
              onClick={() => set('label')(l)}
              className={cn(
                'min-h-11 cursor-pointer rounded-full border px-4 text-ui font-semibold transition-colors',
                v.label === l ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-ink-2 hover:border-brand',
              )}
            >
              {l}
            </button>
          ))}
          <input
            aria-label="اسم تاني للعنوان"
            value={LABELS.includes(v.label) ? '' : v.label}
            onChange={(e) => set('label')(e.target.value)}
            maxLength={40}
            placeholder="أو اكتب اسم تاني"
            className={cn(inputClass, 'min-h-11 w-44 rounded-full')}
          />
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {text('recipientName', 'اسم المستلم', { autoComplete: 'name', placeholder: 'مثال: محمد أحمد', maxLength: 100 })}
        {text('phone', 'موبايل المستلم', { type: 'tel', inputMode: 'tel', autoComplete: 'tel-national', placeholder: '01012345678', hint: 'المندوب هيتصل بالرقم ده', ltr: true })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${uid}-governorate`} label="المحافظة" error={errors.governorate ?? (govError ? 'معرفناش نجيب المحافظات. حدّث الصفحة.' : null)}>
          {(a11y) => (
            <select
              {...a11y}
              value={v.governorate}
              onChange={(e) => set('governorate')(e.target.value)}
              disabled={!govs}
              autoComplete="address-level1"
              className={cn(inputClass, 'cursor-pointer appearance-auto')}
            >
              <option value="">{govs ? 'اختار المحافظة' : 'بنحمّل المحافظات...'}</option>
              {(govs ?? []).map((g) => (
                <option key={g.code} value={g.code}>
                  {g.ar}
                </option>
              ))}
            </select>
          )}
        </Field>
        {text('city', 'المدينة / المركز', { placeholder: 'مثال: مدينة نصر', autoComplete: 'address-level2', maxLength: 80 })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {text('area', 'المنطقة', { optional: true, placeholder: 'مثال: الحي السابع', autoComplete: 'address-level3', maxLength: 80 })}
        {text('street', 'الشارع', { placeholder: 'مثال: 12 شارع التحرير', autoComplete: 'address-line1', maxLength: 200 })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {text('building', 'العمارة', { optional: true, placeholder: '12', maxLength: 40 })}
        {text('floor', 'الدور', { optional: true, placeholder: '3', inputMode: 'numeric', maxLength: 20 })}
        {text('apartment', 'الشقة', { optional: true, placeholder: '5', maxLength: 20 })}
      </div>

      {text('landmark', 'علامة مميزة', { optional: true, placeholder: 'مثال: جنب صيدلية الشفا', maxLength: 200 })}

      {!forceDefault ? (
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={v.isDefault} onChange={(e) => set('isDefault')(e.target.checked)} className="size-5 cursor-pointer accent-accent" />
          <span className="text-ui font-semibold">خليه العنوان الافتراضي</span>
        </label>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={busy} className={btn.secondary}>
            رجوع
          </button>
        ) : null}
        <SubmitButton busy={busy}>{busy ? 'بنحفظ...' : initial ? 'احفظ التعديلات' : 'احفظ العنوان'}</SubmitButton>
      </div>
    </form>
  );
}
