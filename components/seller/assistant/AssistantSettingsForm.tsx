'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { Panel } from '@/components/account/PageTitle';
import { Alert, Field, inputClass, SubmitButton, TextInput } from '@/components/auth/fields';
import { Switch } from '@/components/seller/products/ui';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';

import { aiError } from './errors';
import type { AssistantSettings, AssistantTone } from './types';

const TONES: { value: AssistantTone; label: string; example: string }[] = [
  { value: 'friendly', label: 'ودود', example: 'أهلاً بيك! أيوه المقاس ده متاح، وعندنا منه أسود وكحلي. تحب أقولك على الأسعار؟' },
  { value: 'formal', label: 'رسمي', example: 'مرحباً بحضرتك. المقاس متاح حالياً باللونين الأسود والكحلي، ويسعدنا خدمتك في أي استفسار.' },
  { value: 'brief', label: 'مختصر', example: 'متاح أسود وكحلي. السعر 350 ج.م.' },
];
const MAX_INFO = 2000;

export function AssistantSettingsForm({ initial }: { initial: AssistantSettings }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [name, setName] = useState(initial.name);
  const [tone, setTone] = useState<AssistantTone>(initial.tone);
  const [extraInfo, setExtraInfo] = useState(initial.extraInfo);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const ids = { enabled: useId(), tone: useId(), info: useId() };
  const dirty = enabled !== saved.enabled || name.trim() !== saved.name || tone !== saved.tone || extraInfo.trim() !== saved.extraInfo;
  const nameError = name.trim().length > 40 ? 'الاسم 40 حرف بالكتير' : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError || extraInfo.length > MAX_INFO) return;
    setBusy(true);
    setResult(null);
    try {
      const next = await api.patch<AssistantSettings>('brand/assistant/settings', { enabled, name: name.trim(), tone, extraInfo: extraInfo.trim() });
      setSaved(next);
      setName(next.name);
      setExtraInfo(next.extraInfo);
      setResult({ tone: 'success', text: next.enabled ? 'اتحفظ. المساعد هيرد على العملاء بالإعدادات الجديدة.' : 'اتحفظ. المساعد مقفول ومش هيظهر في متجرك.' });
      router.refresh();
    } catch (err) {
      setResult({ tone: 'danger', text: aiError(err, 'معرفناش نحفظ الإعدادات. جرّب تاني.') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="إعدادات المساعد">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {!saved.available ? <Alert tone="warning" title="الذكاء الاصطناعي مش متاح على السيرفر دلوقتي">إعداداتك هتتحفظ، والمساعد هيشتغل أول ما الخدمة ترجع.</Alert> : null}

        <div className={cn('flex items-center gap-3 rounded-card border p-3.5', enabled ? 'border-brand bg-accent-soft/40' : 'border-line')}>
          <div className="min-w-0 flex-1">
            <label htmlFor={ids.enabled} className="font-bold">
              {enabled ? 'المساعد شغّال' : 'المساعد مقفول'}
            </label>
            <p className="text-meta text-ink-3">بيرد على أسئلة العملاء في صفحة متجرك ومنتجاتك 24 ساعة، من بيانات منتجاتك وسياساتك.</p>
          </div>
          <Switch id={ids.enabled} checked={enabled} onChange={setEnabled} label="تشغيل المساعد" />
        </div>

        <TextInput label="اسم المساعد" optional value={name} onChange={setName} maxLength={40} placeholder={saved.displayName || 'مساعد المتجر'} hint={`لو سبته فاضي هيظهر باسم «${saved.displayName || 'مساعد المتجر'}»`} error={nameError} />

        <fieldset className="flex flex-col gap-2">
          <legend id={ids.tone} className="mb-2 text-ui font-semibold">
            طريقة الكلام
          </legend>
          <div role="radiogroup" aria-labelledby={ids.tone} className="grid gap-2 sm:grid-cols-3">
            {TONES.map((t) => {
              const on = tone === t.value;
              return (
                <label
                  key={t.value}
                  className={cn('flex cursor-pointer flex-col gap-2 rounded-card border p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-brand/40', on ? 'border-brand bg-accent-soft/40' : 'border-line hover:border-ink-3')}
                >
                  <span className="flex items-center gap-2 font-bold">
                    <input type="radio" name="tone" value={t.value} checked={on} onChange={() => setTone(t.value)} className="size-4 accent-[var(--accent)]" />
                    {t.label}
                  </span>
                  <span className="rounded-card rounded-ss-sm bg-sunken px-3 py-2 text-meta text-ink-2">{t.example}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field id={ids.info} label="معلومات إضافية" optional hint={`${extraInfo.length}/${MAX_INFO} — ساعات العمل، الضمان، الفروع، طرق الدفع، أسئلة بتتكرر... المساعد بيرد منها.`} error={extraInfo.length > MAX_INFO ? `${MAX_INFO} حرف بالكتير` : null}>
          {(a11y) => (
            <textarea
              {...a11y}
              rows={6}
              maxLength={MAX_INFO}
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              placeholder={'مثال:\nمواعيدنا من 10 الصبح لـ 10 بالليل ما عدا الجمعة.\nالضمان سنة على كل الأجهزة.\nعندنا فرع في مدينة نصر وفرع في المعادي.'}
              className={cn(inputClass, 'min-h-40 py-3 leading-relaxed')}
            />
          )}
        </Field>

        <div aria-live="polite">{result ? <Alert tone={result.tone} title={result.text} /> : null}</div>
        <SubmitButton busy={busy} disabled={!dirty} className="self-start">
          احفظ الإعدادات
        </SubmitButton>
      </form>
    </Panel>
  );
}
