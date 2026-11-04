'use client';

import { Field, inputClass } from '@/components/auth/fields';
import { cn } from '@/lib/cn';

import type { SpecDef } from './types';
import { Switch } from './ui';

/** Answers to the template fields as typed (numbers are converted on save). */
export type SpecDraft = Record<string, string | boolean>;

/** The category's own fields (brand, warranty, material...), one input per SpecDef type. */
export function SpecsFields({ specs, values, onChange, errors }: { specs: SpecDef[]; values: SpecDraft; onChange: (v: SpecDraft) => void; errors: Record<string, string> }) {
  if (!specs.length) return null;
  const set = (key: string, v: string | boolean) => onChange({ ...values, [key]: v });
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-bold">المواصفات</p>
        <p className="text-meta text-ink-3">بتظهر للعميل في صفحة المنتج، واللي عليها فلتر بيدوّر بيها.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {specs.map((s) => {
          const label = s.unit && s.type === 'number' ? `${s.labelAr} (${s.unit})` : s.labelAr;
          const v = values[s.key];
          if (s.type === 'boolean')
            return (
              <div key={s.key} className="flex items-center gap-3 self-end rounded-card border border-line px-3.5 py-3">
                <span className="min-w-0 flex-1 text-ui font-semibold">{s.labelAr}</span>
                <Switch checked={v === true} onChange={(on) => set(s.key, on)} label={s.labelAr} />
              </div>
            );
          return (
            <Field key={s.key} label={label} optional={!s.required} error={errors[s.key]}>
              {(a11y) =>
                s.type === 'select' ? (
                  <select {...a11y} value={typeof v === 'string' ? v : ''} onChange={(e) => set(s.key, e.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                    <option value="">اختار</option>
                    {(s.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...a11y}
                    value={typeof v === 'string' ? v : ''}
                    onChange={(e) => set(s.key, e.target.value)}
                    maxLength={100}
                    inputMode={s.type === 'number' ? 'decimal' : undefined}
                    dir={s.type === 'number' ? 'ltr' : undefined}
                    className={cn(inputClass, s.type === 'number' && 'text-start [unicode-bidi:plaintext]')}
                  />
                )
              }
            </Field>
          );
        })}
      </div>
    </div>
  );
}
