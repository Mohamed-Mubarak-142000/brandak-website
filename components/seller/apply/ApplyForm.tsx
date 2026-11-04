'use client';

import { ArrowLeft, ArrowRight, BadgePercent, Check, CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, btn, Field, SubmitButton, TextInput } from '@/components/auth/fields';
import { cleanPhone, EG_MOBILE } from '@/components/auth/validation';
import { notifySessionChanged } from '@/components/header/AccountNav';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num, percent, price } from '@/lib/format';
import type { OwnerBrand } from '@/lib/seller-types';
import { STORE_TYPES, storeTypeInfo } from '@/lib/store-types';
import type { Category, CommissionTerms, StoreType } from '@/lib/types';

import { textareaClass } from '../bits';
import { sellerError } from '../errors';
import { ImageUpload, type UploadedImage } from '../ImageUpload';
import { normalizeSocial } from '../social';

const STEPS = ['نوع النشاط', 'البيانات والأقسام', 'التواصل', 'الصور', 'العمولة'];
const NAME_LABEL: Record<StoreType, string> = { BRAND: 'اسم البراند', SHOWROOM: 'اسم المعرض', WAREHOUSE: 'اسم المخزن', SHOP: 'اسم المحل' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Top-level sections a store of `type` can pick (no storeTypes = open to every type). */
export const sectionsFor = (all: Category[], type: StoreType | null) =>
  all
    .filter((c) => c.isActive && !c.parentId && (!type || !c.storeTypes?.length || c.storeTypes.includes(type)))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.nameAr.localeCompare(b.nameAr, 'ar'));

/** "Open your store": five steps, then POST brand-applications. Mirrors the app's seller/apply. */
export function ApplyForm({ categories, terms, defaults }: { categories: Category[]; terms: CommissionTerms; defaults: { phone: string; email: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [storeType, setStoreType] = useState<StoreType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cats, setCats] = useState<string[]>([]);
  const [phone, setPhone] = useState(defaults.phone);
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState(defaults.email);
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState<UploadedImage | null>(null);
  const [cover, setCover] = useState<UploadedImage | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<OwnerBrand | null>(null);

  const info = storeTypeInfo(storeType);
  const sections = sectionsFor(categories, storeType);
  const rate = terms.commissionRate;

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !storeType) e.storeType = 'اختار نوع نشاطك';
    if (step === 1) {
      if (name.trim().length < 2) e.name = `${NAME_LABEL[storeType ?? 'BRAND']} حرفين على الأقل`;
      if (!cats.length) e.cats = 'اختار قسم واحد على الأقل';
    }
    if (step === 2) {
      if (!EG_MOBILE.test(cleanPhone(phone))) e.phone = 'رقم موبايل مصري مش صحيح (مثال: 01012345678)';
      if (whatsapp.trim() && !EG_MOBILE.test(cleanPhone(whatsapp))) e.whatsapp = 'رقم واتساب مش صحيح';
      if (email.trim() && !EMAIL.test(email.trim())) e.email = 'الإيميل ده مش صحيح';
    }
    if (step === 4 && !agreed) e.terms = 'وافق على نظام العمولة عشان تبعت الطلب';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    setBusy(true);
    setFailure(null);
    try {
      const brand = await api.post<OwnerBrand>('brand-applications', {
        storeType,
        name: name.trim(),
        description: description.trim() || undefined,
        categoryIds: cats,
        contact: { phone: cleanPhone(phone), email: email.trim() || undefined, whatsapp: cleanPhone(whatsapp) || undefined },
        socialLinks: {
          instagram: normalizeSocial('instagram', instagram),
          facebook: normalizeSocial('facebook', facebook),
          tiktok: normalizeSocial('tiktok', tiktok),
          website: normalizeSocial('website', website),
        },
        logoFileId: logo?.fileId || undefined,
        coverFileId: cover?.fileId || undefined,
      });
      setDone(brand);
      notifySessionChanged();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setFailure(sellerError(e, 'معرفناش نبعت الطلب. جرّب تاني.'));
    } finally {
      setBusy(false);
    }
  };

  const next = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (step === 4) void submit();
    else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center rounded-panel border border-line bg-surface px-6 py-12 text-center shadow-card">
        <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheck aria-hidden className="size-9" />
        </span>
        <h2 className="mt-4 text-page font-extrabold">متجرك تحت المراجعة، عادةً خلال يوم عمل</h2>
        <p className="mt-2 max-w-md text-body text-ink-2">
          بعتنا طلب «{done.name}» لفريق فاترينة. هيوصلك إشعار أول ما نخلص، وتقدر في الوقت ده تجهّز إعدادات الشحن وتضيف منتجاتك.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={btn.primary}
            onClick={() => {
              router.push('/seller');
              router.refresh();
            }}
          >
            افتح لوحة متجرك
          </button>
          <Link href="/" className={btn.secondary}>
            رجوع للتسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={next} noValidate className="flex flex-col gap-5">
      <Progress step={step} />
      {failure ? <Alert title={failure} /> : null}

      <section aria-labelledby="apply-step" className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-4 shadow-card sm:p-6">
        {step === 0 ? (
          <>
            <StepTitle title="نوع نشاطك إيه؟" body="بيساعد العملاء يلاقوك في المكان الصح. تقدر تغيّره بعدين من إعدادات المتجر." />
            <div role="radiogroup" aria-labelledby="apply-step" aria-invalid={errors.storeType ? true : undefined} className="grid gap-3 sm:grid-cols-2">
              {STORE_TYPES.map((t) => {
                const on = storeType === t.type;
                const Icon = t.icon;
                return (
                  <button
                    key={t.type}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      if (t.type !== storeType) setCats([]);
                      setStoreType(t.type);
                      setErrors({});
                    }}
                    className={cn(
                      'flex cursor-pointer flex-col gap-2 rounded-card border-2 p-4 text-start transition-colors',
                      on ? 'border-accent bg-accent-soft' : 'border-line hover:border-brand',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('grid size-10 place-items-center rounded-full', on ? 'bg-accent text-on-accent' : 'bg-sunken text-accent')}>
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-extrabold">{t.label}</span>
                        <span className="block text-meta text-ink-2">{t.description}</span>
                      </span>
                      {on ? <Check aria-hidden className="size-5 text-accent" /> : null}
                    </span>
                    <ul className="flex flex-col gap-1 ps-1">
                      {t.system.map((line) => (
                        <li key={line} className="flex gap-1.5 text-meta text-ink-2">
                          <span aria-hidden>•</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            {errors.storeType ? <p className="text-meta font-semibold text-danger">{errors.storeType}</p> : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <StepTitle title={`عرّفنا على ال${info.label}`} />
            <TextInput label={NAME_LABEL[info.type]} value={name} onChange={setName} maxLength={60} error={errors.name} placeholder="مثال: معرض النور للأجهزة" autoFocus />
            <Field label="وصف قصير" optional hint={`${num(description.length)}/1000`}>
              {(a11y) => (
                <textarea {...a11y} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="بتبيعوا إيه؟ وإيه اللي يميزكم؟" className={textareaClass} />
              )}
            </Field>
            <CategoryPicker sections={sections} value={cats} onChange={setCats} error={errors.cats} label={`ال${info.label} بيبيع في أنهي أقسام؟`} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <StepTitle title="إزاي العملاء يوصلولكم؟" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="موبايل المتجر" value={phone} onChange={setPhone} type="tel" inputMode="tel" autoComplete="tel" ltr placeholder="01012345678" error={errors.phone} />
              <TextInput label="واتساب" optional value={whatsapp} onChange={setWhatsapp} type="tel" inputMode="tel" ltr placeholder="01012345678" error={errors.whatsapp} />
              <TextInput label="البريد الإلكتروني" optional value={email} onChange={setEmail} type="email" autoComplete="email" ltr placeholder="store@mail.com" error={errors.email} className="sm:col-span-2" />
            </div>
            <p className="mt-2 text-ui font-bold">السوشيال ميديا</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="إنستجرام" optional value={instagram} onChange={setInstagram} ltr placeholder="@store" />
              <TextInput label="فيسبوك" optional value={facebook} onChange={setFacebook} ltr placeholder="facebook.com/store" />
              <TextInput label="تيك توك" optional value={tiktok} onChange={setTiktok} ltr placeholder="@store" />
              <TextInput label="الموقع" optional value={website} onChange={setWebsite} ltr placeholder="store.com" />
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <StepTitle title="اللوجو والغلاف" body="صور واضحة بتخلي العملاء يثقوا في متجرك أكتر. تقدر تضيفها بعدين كمان." />
            <ImageUpload label="الغلاف (عرضي)" purpose="BRAND_COVER" value={cover} onChange={setCover} />
            <div className="flex flex-wrap items-center gap-4">
              <ImageUpload label="اللوجو" purpose="BRAND_LOGO" value={logo} onChange={setLogo} round hint="مربّع، JPG أو PNG أو WEBP" />
              <p className="min-w-0 flex-1 font-bold">{name}</p>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <StepTitle title="إزاي فاترينة بتكسب" />
            <div className="flex flex-col items-center gap-1 rounded-card bg-accent-soft px-4 py-6 text-center">
              <BadgePercent aria-hidden className="size-10 text-accent" />
              <p className="text-display font-extrabold text-accent">{percent(rate)}</p>
              <p className="font-bold">بس من كل طلب يتسلّم للعميل</p>
              <p className="text-ui text-ink-2">مفيش اشتراك، ومفيش رسوم فتح متجر. لو مبعتش، مش بتدفع حاجة.</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                `العمولة على قيمة المنتجات بس، من غير الشحن. مثلاً طلب بـ ${price(500)} = ${price(500 * rate)}.`,
                'الطلب الملغي أو اللي العميل رفض استلامه مفيش عليه عمولة.',
                `بتسدد المستحق كل ${num(terms.settlementDays)} يوم بتحويل InstaPay من لوحة المتجر في التطبيق.`,
                `لو المستحق عدّى ${price(terms.maxUnpaidBalance)} أو عدّى ميعاد السداد، المتجر بيقف عن استقبال طلبات جديدة لحد ما تسدد.`,
                'بنحميك من الطلبات الوهمية: العميل الجديد بيأكد طلبه بكود قبل ما يوصلك، وبتشوف سجل استلامه.',
              ].map((line) => (
                <li key={line} className="flex gap-2 text-ui text-ink-2">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                  {line}
                </li>
              ))}
            </ul>
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-card border-2 p-4 has-focus-visible:outline-2 has-focus-visible:outline-brand',
                errors.terms ? 'border-danger' : agreed ? 'border-brand bg-accent-soft' : 'border-line',
              )}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  setErrors({});
                }}
                aria-invalid={errors.terms ? true : undefined}
                aria-describedby={errors.terms ? 'terms-error' : undefined}
                className="mt-0.5 size-5 shrink-0 accent-accent"
              />
              <span className="text-ui">
                موافق على نظام العمولة و
                <Link href="/terms" target="_blank" className="font-bold text-accent underline-offset-4 hover:underline">
                  الشروط والأحكام
                </Link>
              </span>
            </label>
            {errors.terms ? (
              <p id="terms-error" className="text-meta font-semibold text-danger">
                {errors.terms}
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button type="button" className={btn.secondary} onClick={() => setStep((s) => s - 1)} disabled={busy}>
            <ArrowRight aria-hidden className="size-4" />
            رجوع
          </button>
        ) : (
          <span />
        )}
        <SubmitButton busy={busy}>
          {step === 4 ? 'إرسال الطلب للمراجعة' : 'التالي'}
          {step === 4 ? <Check aria-hidden className="size-4" /> : <ArrowLeft aria-hidden className="size-4" />}
        </SubmitButton>
      </div>
    </form>
  );
}

function StepTitle({ title, body }: { title: string; body?: string }) {
  return (
    <div>
      <h2 id="apply-step" className="text-section font-extrabold">
        {title}
      </h2>
      {body ? <p className="mt-1 text-ui text-ink-2">{body}</p> : null}
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <p className="mb-2 text-ui font-bold">
        الخطوة {num(step + 1)} من {num(STEPS.length)}: <span className="text-accent">{STEPS[step]}</span>
      </p>
      <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <ol aria-hidden className="mt-2 hidden justify-between text-meta sm:flex">
        {STEPS.map((s, i) => (
          <li key={s} className={i <= step ? (i === step ? 'font-bold text-accent' : 'text-accent') : 'text-ink-3'}>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Up to five top-level sections, as toggle chips. */
export function CategoryPicker({
  sections,
  value,
  onChange,
  error,
  label,
}: {
  sections: Category[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  label: string;
}) {
  const full = value.length >= 5;
  return (
    <fieldset className="min-w-0" aria-describedby="cats-note">
      <legend className="text-ui font-semibold text-ink">{label}</legend>
      <p id="cats-note" className={cn('mt-1 text-meta', error ? 'font-semibold text-danger' : 'text-ink-3')}>
        {error ?? `اختار من 1 لـ 5 أقسام (${num(value.length)}/5). هتقدر تضيف منتجات في كل الأقسام الفرعية تحتها.`}
      </p>
      {sections.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {sections.map((c) => {
            const on = value.includes(c._id);
            return (
              <label
                key={c._id}
                className={cn(
                  'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-ui font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-brand',
                  on ? 'border-accent bg-accent-soft text-accent' : 'border-line-strong text-ink-2 hover:border-brand',
                  !on && full ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  disabled={!on && full}
                  onChange={() => onChange(on ? value.filter((x) => x !== c._id) : [...value, c._id])}
                />
                {on ? <Check aria-hidden className="size-4" /> : null}
                {c.nameAr}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-card bg-sunken p-3 text-ui text-ink-2">معرفناش نجيب الأقسام دلوقتي. حدّث الصفحة وجرّب تاني.</p>
      )}
    </fieldset>
  );
}
