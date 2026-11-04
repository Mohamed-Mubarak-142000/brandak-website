'use client';

import { Check, CircleAlert, CircleCheck, Eye, EyeOff, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import { latinDigits, PASSWORD_RULES, passwordStrength } from './validation';

/** Form primitives shared by the sign-in pages and the account area. */

export const inputClass =
  'min-h-12 w-full rounded-card border border-line-strong bg-surface px-3.5 text-body text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-sunken aria-invalid:border-danger aria-invalid:focus:ring-danger/20';

export const btn = {
  primary:
    'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-6 font-bold text-ink transition-colors hover:border-brand hover:text-accent disabled:cursor-not-allowed disabled:opacity-60',
  danger:
    'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-danger px-6 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
  quiet: 'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-2 font-bold text-accent hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60',
};

/** Label + control + hint/error, wired with ids for screen readers. */
export function Field({
  id: idProp,
  label,
  error,
  hint,
  optional,
  children,
  className,
}: {
  id?: string;
  label: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => React.ReactNode;
}) {
  const auto = useId();
  const id = idProp ?? auto;
  const noteId = `${id}-note`;
  const note = error || hint;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-ui font-semibold text-ink">
        {label}
        {optional ? <span className="ms-1 font-normal text-ink-3">(اختياري)</span> : null}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': note ? noteId : undefined })}
      {note ? (
        <p id={noteId} className={cn('text-meta', error ? 'flex items-center gap-1 font-semibold text-danger' : 'text-ink-3')}>
          {error ? <CircleAlert aria-hidden className="size-3.5 shrink-0" /> : null}
          {note}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  ltr?: boolean;
};

export function TextInput({ label, value, onChange, error, hint, optional, ltr, className, ...rest }: InputProps) {
  return (
    <Field id={rest.id} label={label} error={error} hint={hint} optional={optional} className={className}>
      {(a11y) => (
        <input
          {...rest}
          {...a11y}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={ltr ? 'ltr' : undefined}
          className={cn(inputClass, ltr && 'text-start [unicode-bidi:plaintext]')}
        />
      )}
    </Field>
  );
}

export function PasswordInput({ label, value, onChange, error, hint, className, ...rest }: Omit<InputProps, 'type' | 'ltr'>) {
  const [shown, setShown] = useState(false);
  return (
    <Field id={rest.id} label={label} error={error} hint={hint} className={className}>
      {(a11y) => (
        <div className="relative">
          <input
            {...rest}
            {...a11y}
            type={shown ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            className={cn(inputClass, 'pe-12 text-start')}
          />
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
            aria-pressed={shown}
            className="absolute inset-y-0 inset-e-0 grid w-12 cursor-pointer place-items-center rounded-e-card text-ink-3 hover:text-ink"
          >
            {shown ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        </div>
      )}
    </Field>
  );
}

const STRENGTH = ['ضعيفة', 'ضعيفة', 'مقبولة', 'كويسة', 'قوية'];

/** Live checklist of the backend's password rule, plus a strength bar. */
export function PasswordHints({ value }: { value: string }) {
  const score = passwordStrength(value);
  const tone = score <= 1 ? 'bg-danger' : score === 2 ? 'bg-warning' : 'bg-success';
  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {value ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={cn('h-1 flex-1 rounded-full', i <= score ? tone : 'bg-line')} />
            ))}
          </div>
          <span className="text-meta font-semibold text-ink-2">قوة كلمة السر: {STRENGTH[score]}</span>
        </div>
      ) : null}
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(value);
          return (
            <li key={r.key} className={cn('flex items-center gap-1 text-meta', ok ? 'text-success' : 'text-ink-3')}>
              {ok ? <Check aria-hidden className="size-3.5" /> : <span aria-hidden className="size-1.5 rounded-full bg-current" />}
              {r.label}
              <span className="sr-only">{ok ? '، تمام' : '، لسه'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Six boxes for a code; typing, backspace, arrows and pasting the whole code all work. */
export function OtpInput({
  value,
  onChange,
  error,
  disabled,
  label = 'الكود',
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  disabled?: boolean;
  label?: string;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');
  const focus = (i: number) => refs.current[Math.max(0, Math.min(5, i))]?.focus();

  /** Writes `chars` from box i on (never leaving a gap), then moves focus after them. */
  const put = (i: number, chars: string) => {
    const arr = value.split('');
    const start = Math.min(i, arr.length);
    for (let k = 0; k < chars.length && start + k < 6; k++) arr[start + k] = chars[k];
    onChange(arr.join('').slice(0, 6));
    focus(Math.min(start + chars.length, 5));
  };

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="sr-only">{label} (6 أرقام)</legend>
      <div dir="ltr" className="flex justify-center gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={autoFocus && i === 0}
            aria-label={`الرقم ${i + 1}`}
            aria-invalid={error || undefined}
            maxLength={6}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const typed = latinDigits(e.target.value).replace(/\D/g, '');
              if (!e.target.value) onChange(value.slice(0, i) + value.slice(i + 1));
              // Two digits = the old one plus the new one (caret wasn't on a selection); keep the new.
              else if (typed) put(i, typed.length === 2 && d ? typed.replace(d, '') || d : typed);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = latinDigits(e.clipboardData.getData('text')).replace(/\D/g, '');
              if (!text) return;
              onChange(text.slice(0, 6));
              focus(Math.min(text.length, 5));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !d && i > 0) {
                e.preventDefault();
                onChange(value.slice(0, i - 1));
                focus(i - 1);
              } else if (e.key === 'ArrowLeft') focus(i - 1);
              else if (e.key === 'ArrowRight') focus(i + 1);
            }}
            className={cn(
              'size-12 rounded-card border bg-surface text-center text-section font-bold text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 disabled:bg-sunken sm:size-14',
              error ? 'border-danger' : d ? 'border-ink-3' : 'border-line-strong',
            )}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function Alert({ tone = 'danger', title, children, className }: { tone?: 'danger' | 'warning' | 'success' | 'info'; title: string; children?: React.ReactNode; className?: string }) {
  const Icon = tone === 'danger' ? CircleAlert : tone === 'warning' ? TriangleAlert : tone === 'success' ? CircleCheck : Info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-card px-4 py-3 text-ui',
        tone === 'danger' && 'bg-danger-soft text-danger',
        tone === 'warning' && 'bg-warning-soft text-warning',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'info' && 'bg-sunken text-ink-2',
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <p className="font-bold">{title}</p>
        {children ? <div className="mt-0.5 text-ink-2">{children}</div> : null}
      </div>
    </div>
  );
}

/** Submit button with a spinner; stays disabled while the request runs. */
export function SubmitButton({ busy, children, className, variant = 'primary', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; variant?: keyof typeof btn }) {
  return (
    <button type="submit" {...rest} disabled={busy || rest.disabled} aria-busy={busy || undefined} className={cn(btn[variant], className)}>
      {busy ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
      {children}
    </button>
  );
}

/** Seconds left before "resend" works again. */
export function useCooldown(initial = 0) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return { left, start: (seconds = 60) => setLeft(seconds) };
}
