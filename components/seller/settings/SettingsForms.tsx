'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { Panel } from '@/components/account/PageTitle';
import { Alert, btn, Field, inputClass, SubmitButton, TextInput } from '@/components/auth/fields';
import { cleanPhone, EG_MOBILE, latinDigits, nationalPhone } from '@/components/auth/validation';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { num, price } from '@/lib/format';
import type { BrandSettings, OwnerBrand } from '@/lib/seller-types';
import { STORE_TYPES, storeTypeInfo } from '@/lib/store-types';
import type { Category, Governorate, ShippingZone, StoreType } from '@/lib/types';

import { CategoryPicker, sectionsFor } from '../apply/ApplyForm';
import { ChoiceChip, textareaClass, Toggle } from '../bits';
import { sellerError } from '../errors';
import { ImageUpload, type UploadedImage } from '../ImageUpload';
import { displaySocial, normalizeSocial } from '../social';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "" → null, "٥٠" → 50, junk → NaN. */
const amount = (s: string) => {
  const t = latinDigits(s).trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

/** PATCH brands/me with one section's fields, then re-render the server parts (nav, header). */
function useSave() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const save = async (body: Record<string, unknown>, done = 'اتحفظ') => {
    setBusy(true);
    setMsg(null);
    try {
      await api.patch<OwnerBrand>('brands/me', body);
      setMsg({ tone: 'success', text: done });
      router.refresh();
      return true;
    } catch (e) {
      setMsg({ tone: 'danger', text: sellerError(e, 'معرفناش نحفظ. جرّب تاني.') });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { busy, msg, setMsg, save };
}

function Status({ msg }: { msg: { tone: 'success' | 'danger'; text: string } | null }) {
  return <div aria-live="polite">{msg ? <Alert tone={msg.tone} title={msg.text} /> : null}</div>;
}

// ---------- Profile ----------

export function ProfileForm({ brand, categories }: { brand: OwnerBrand; categories: Category[] }) {
  const { busy, msg, setMsg, save } = useSave();
  const image = useSave();
  const [storeType, setStoreType] = useState<StoreType>(brand.storeType ?? 'BRAND');
  const [name, setName] = useState(brand.name);
  const [description, setDescription] = useState(brand.description ?? '');
  const [cats, setCats] = useState<string[]>(brand.categoryIds);
  const [logo, setLogo] = useState<UploadedImage | null>(brand.logoUrl ? { fileId: '', url: brand.logoUrl } : null);
  const [cover, setCover] = useState<UploadedImage | null>(brand.coverUrl ? { fileId: '', url: brand.coverUrl } : null);
  const [phone, setPhone] = useState(nationalPhone(brand.contact?.phone));
  const [whatsapp, setWhatsapp] = useState(nationalPhone(brand.contact?.whatsapp));
  const [email, setEmail] = useState(brand.contact?.email ?? '');
  const [instagram, setInstagram] = useState(displaySocial(brand.socialLinks?.instagram));
  const [facebook, setFacebook] = useState(displaySocial(brand.socialLinks?.facebook));
  const [tiktok, setTiktok] = useState(displaySocial(brand.socialLinks?.tiktok));
  const [website, setWebsite] = useState(displaySocial(brand.socialLinks?.website));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const typeId = useId();

  const info = storeTypeInfo(storeType);
  const sections = sectionsFor(categories, storeType);
  // Categories the store already has but the list no longer offers still count (and can be removed).
  const known = new Set(sections.map((c) => c._id));
  const extra = categories.filter((c) => cats.includes(c._id) && !known.has(c._id));

  // Logo and cover are saved the moment they finish uploading, as in the app.
  const saveImage = async (field: 'logoFileId' | 'coverFileId', img: UploadedImage, set: (v: UploadedImage) => void) => {
    const ok = await image.save({ [field]: img.fileId }, field === 'logoFileId' ? 'اتحفظ اللوجو' : 'اتحفظ الغلاف');
    if (!ok) throw new Error('save failed'); // ImageUpload drops the preview; the message shows above.
    set(img);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 2) er.name = 'الاسم حرفين على الأقل';
    if (!cats.length) er.cats = 'اختار قسم واحد على الأقل';
    if (!EG_MOBILE.test(cleanPhone(phone))) er.phone = 'رقم موبايل مصري مش صحيح (مثال: 01012345678)';
    if (whatsapp.trim() && !EG_MOBILE.test(cleanPhone(whatsapp))) er.whatsapp = 'رقم واتساب مش صحيح';
    if (email.trim() && !EMAIL.test(email.trim())) er.email = 'الإيميل ده مش صحيح';
    setErrors(er);
    if (Object.keys(er).length) return setMsg({ tone: 'danger', text: 'راجع الخانات المعلّمة بالأحمر.' });
    void save(
      {
        storeType,
        name: name.trim(),
        description: description.trim(),
        categoryIds: cats,
        contact: { phone: cleanPhone(phone), whatsapp: cleanPhone(whatsapp) || undefined, email: email.trim() || undefined },
        socialLinks: {
          instagram: normalizeSocial('instagram', instagram),
          facebook: normalizeSocial('facebook', facebook),
          tiktok: normalizeSocial('tiktok', tiktok),
          website: normalizeSocial('website', website),
        },
      },
      'اتحفظت بيانات المتجر',
    );
  };

  return (
    <Panel title="بيانات المتجر">
      <div className="flex flex-col gap-4">
        <Status msg={image.msg} />
        <ImageUpload label="الغلاف (عرضي)" purpose="BRAND_COVER" value={cover} onChange={(img) => saveImage('coverFileId', img, setCover)} />
        <ImageUpload label="اللوجو" purpose="BRAND_LOGO" value={logo} onChange={(img) => saveImage('logoFileId', img, setLogo)} round hint="مربّع، JPG أو PNG أو WEBP لحد 4 ميجا" />
      </div>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4 border-t border-line pt-5">
        <Field id={typeId} label="نوع النشاط" hint={info.description}>
          {(a11y) => (
            <select
              {...a11y}
              value={storeType}
              onChange={(e) => {
                const t = e.target.value as StoreType;
                // Sections differ per type; pick again for the new one.
                if (t !== storeType) setCats((c) => c.filter((id) => sectionsFor(categories, t).some((s) => s._id === id)));
                setStoreType(t);
              }}
              className={inputClass}
            >
              {STORE_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <TextInput label={`اسم ال${info.label}`} value={name} onChange={setName} maxLength={60} error={errors.name} />
        <Field label="الوصف" optional hint={`${num(description.length)}/1000`}>
          {(a11y) => <textarea {...a11y} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} placeholder="بتبيعوا إيه؟ وإيه اللي يميزكم؟" className={textareaClass} />}
        </Field>
        <CategoryPicker sections={[...sections, ...extra]} value={cats} onChange={setCats} error={errors.cats} label="الأقسام" />

        <p className="mt-2 font-bold">التواصل</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="موبايل المتجر" value={phone} onChange={setPhone} type="tel" inputMode="tel" ltr placeholder="01012345678" error={errors.phone} />
          <TextInput label="واتساب" optional value={whatsapp} onChange={setWhatsapp} type="tel" inputMode="tel" ltr placeholder="01012345678" error={errors.whatsapp} />
          <TextInput label="البريد الإلكتروني" optional value={email} onChange={setEmail} type="email" ltr placeholder="store@mail.com" error={errors.email} className="sm:col-span-2" />
        </div>
        <p className="mt-2 font-bold">السوشيال ميديا</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="إنستجرام" optional value={instagram} onChange={setInstagram} ltr placeholder="@store" />
          <TextInput label="فيسبوك" optional value={facebook} onChange={setFacebook} ltr placeholder="facebook.com/store" />
          <TextInput label="تيك توك" optional value={tiktok} onChange={setTiktok} ltr placeholder="@store" />
          <TextInput label="الموقع" optional value={website} onChange={setWebsite} ltr placeholder="store.com" />
        </div>
        <Status msg={msg} />
        <SubmitButton busy={busy} className="self-start">
          حفظ بيانات المتجر
        </SubmitButton>
      </form>
    </Panel>
  );
}

// ---------- Orders on/off ----------

export function AcceptingForm({ settings }: { settings: BrandSettings }) {
  const { busy, msg, save } = useSave();
  const [accepts, setAccepts] = useState(settings.acceptsOrders);
  const [resellers, setResellers] = useState(!!settings.allowResellers);
  return (
    <Panel title="استقبال الطلبات">
      <div className="flex flex-col gap-3">
        <Toggle
          title="استقبال طلبات"
          body="اقفلها مؤقتاً لو في أجازة أو المخزون خلص. المتجر هيفضل ظاهر للعملاء."
          checked={accepts}
          disabled={busy}
          onChange={async (v) => {
            setAccepts(v);
            if (!(await save({ settings: { acceptsOrders: v } }, v ? 'المتجر بيستقبل طلبات' : 'وقفت استقبال الطلبات مؤقتاً'))) setAccepts(!v);
          }}
        />
        <Toggle
          title="البيع عن طريق المسوّقين"
          body="مسوّقين يبيعوا منتجاتك بسعرهم لمتابعينهم. انت بتشحن وتحصّل، وبتاخد سعرك كامل."
          checked={resellers}
          disabled={busy}
          onChange={async (v) => {
            setResellers(v);
            if (!(await save({ settings: { allowResellers: v } }, v ? 'المسوّقين يقدروا يبيعوا منتجاتك' : 'وقفت البيع عن طريق المسوّقين'))) setResellers(!v);
          }}
        />
        <Status msg={msg} />
      </div>
    </Panel>
  );
}

// ---------- Shipping ----------

export function ShippingForm({ settings, governorates }: { settings: BrandSettings; governorates: Governorate[] }) {
  const { busy, msg, setMsg, save } = useSave();
  const [zones, setZones] = useState<ShippingZone[]>(settings.shippingZones ?? []);
  const [outside, setOutside] = useState(settings.defaultShippingFee != null);
  const [defaultFee, setDefaultFee] = useState(settings.defaultShippingFee != null ? String(settings.defaultShippingFee) : '');
  const [freeOver, setFreeOver] = useState(settings.freeShippingThreshold != null ? String(settings.freeShippingThreshold) : '');
  const [minOrder, setMinOrder] = useState(settings.minOrderAmount ? String(settings.minOrderAmount) : '');
  const [days, setDays] = useState(String(settings.processingDays ?? 2));
  const [gov, setGov] = useState('');
  const [fee, setFee] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const govId = useId();
  const govName = (code: string) => governorates.find((g) => g.code === code)?.ar ?? code;
  const free = governorates.filter((g) => !zones.some((z) => z.governorate === g.code));

  const add = () => {
    const f = amount(fee);
    if (!gov) return setErrors({ zone: 'اختار المحافظة' });
    if (f == null || Number.isNaN(f) || f < 0 || f > 10000) return setErrors({ zoneFee: 'اكتب مصاريف شحن من 0 لـ 10000' });
    setZones((z) => [...z, { governorate: gov, fee: f }]);
    setGov('');
    setFee('');
    setErrors({});
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    const d = amount(defaultFee);
    const fo = amount(freeOver);
    const mo = amount(minOrder);
    const pd = amount(days);
    if (outside && (d == null || Number.isNaN(d) || d < 0 || d > 10000)) er.defaultFee = 'اكتب مصاريف الشحن لباقي المحافظات';
    if (fo != null && (Number.isNaN(fo) || fo < 0)) er.freeOver = 'رقم مش صحيح';
    if (mo != null && (Number.isNaN(mo) || mo < 0)) er.minOrder = 'رقم مش صحيح';
    if (pd == null || Number.isNaN(pd) || pd < 0 || pd > 60 || !Number.isInteger(pd)) er.days = 'من 0 لـ 60 يوم';
    if (!zones.length && !outside) er.zones = 'ضيف محافظة واحدة على الأقل أو فعّل الشحن لباقي المحافظات';
    setErrors(er);
    if (Object.keys(er).length) return setMsg({ tone: 'danger', text: 'راجع الخانات المعلّمة بالأحمر.' });
    void save(
      {
        settings: {
          shippingZones: zones,
          defaultShippingFee: outside ? d : null,
          freeShippingThreshold: fo,
          minOrderAmount: mo ?? 0,
          processingDays: pd,
        },
      },
      'اتحفظت إعدادات الشحن',
    );
  };

  return (
    <Panel title="الشحن">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <p className="font-bold">مصاريف الشحن حسب المحافظة</p>
          {errors.zones ? <p className="mt-1 text-meta font-semibold text-danger">{errors.zones}</p> : null}
          {zones.length ? (
            <table className="mt-3 w-full text-ui">
              <thead className="sr-only">
                <tr>
                  <th scope="col">المحافظة</th>
                  <th scope="col">مصاريف الشحن</th>
                  <th scope="col">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-y border-line">
                {zones.map((z) => (
                  <tr key={z.governorate}>
                    <td className="py-2 pe-2">{govName(z.governorate)}</td>
                    <td className="py-2 font-bold">{z.fee ? price(z.fee) : 'مجاني'}</td>
                    <td className="w-12 py-1 text-end">
                      <button
                        type="button"
                        onClick={() => setZones((x) => x.filter((y) => y.governorate !== z.governorate))}
                        aria-label={`حذف ${govName(z.governorate)}`}
                        className="grid size-11 cursor-pointer place-items-center rounded-full text-danger hover:bg-danger-soft"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-2 text-ui text-ink-3">لسه مضفتش محافظات.</p>
          )}
          {free.length ? (
            <div className="mt-3 grid gap-3 rounded-card bg-sunken p-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto] sm:items-end">
              <Field id={govId} label="المحافظة" error={errors.zone}>
                {(a11y) => (
                  <select {...a11y} value={gov} onChange={(e) => setGov(e.target.value)} className={inputClass}>
                    <option value="">اختار</option>
                    {free.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.ar}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <TextInput label="المصاريف (ج.م)" value={fee} onChange={setFee} inputMode="decimal" ltr placeholder="50" error={errors.zoneFee} />
              <button type="button" onClick={add} className={cn(btn.secondary, 'min-h-12')}>
                <Plus aria-hidden className="size-4" />
                إضافة
              </button>
            </div>
          ) : null}
        </div>

        <Toggle title="بوصّل لباقي المحافظات" body="لو مقفولة، العملاء برّه المحافظات اللي فوق مش هيقدروا يطلبوا توصيل." checked={outside} onChange={setOutside} />
        {outside ? <TextInput label="الشحن لباقي المحافظات (ج.م)" value={defaultFee} onChange={setDefaultFee} inputMode="decimal" ltr placeholder="80" error={errors.defaultFee} /> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput label="شحن مجاني فوق (ج.م)" optional value={freeOver} onChange={setFreeOver} inputMode="decimal" ltr placeholder="1000" error={errors.freeOver} />
          <TextInput label="أقل قيمة طلب (ج.م)" optional value={minOrder} onChange={setMinOrder} inputMode="decimal" ltr placeholder="200" error={errors.minOrder} />
          <TextInput label="أيام التجهيز" value={days} onChange={setDays} inputMode="numeric" ltr placeholder="2" error={errors.days} />
        </div>
        <Status msg={msg} />
        <SubmitButton busy={busy} className="self-start">
          حفظ إعدادات الشحن
        </SubmitButton>
      </form>
    </Panel>
  );
}

// ---------- Policies ----------

export function PoliciesForm({ settings }: { settings: BrandSettings }) {
  const { busy, msg, save } = useSave();
  const [shippingPolicy, setShippingPolicy] = useState(settings.shippingPolicy ?? '');
  const [returnPolicy, setReturnPolicy] = useState(settings.returnPolicy ?? '');
  const [returnDays, setReturnDays] = useState(settings.returnDays ?? 14);
  const options = [...new Set([0, 7, 14, 30, returnDays])].sort((a, b) => a - b);

  return (
    <Panel title="السياسات">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save({ settings: { shippingPolicy: shippingPolicy.trim(), returnPolicy: returnPolicy.trim(), returnDays } }, 'اتحفظت السياسات');
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <Field label="سياسة الشحن" optional hint={`${num(shippingPolicy.length)}/2000`}>
          {(a11y) => (
            <textarea {...a11y} value={shippingPolicy} onChange={(e) => setShippingPolicy(e.target.value)} maxLength={2000} placeholder="مثال: بنشحن خلال يومين، والتوصيل من 2 لـ 5 أيام حسب المحافظة." className={textareaClass} />
          )}
        </Field>
        <Field label="سياسة الاسترجاع" optional hint={`${num(returnPolicy.length)}/2000`}>
          {(a11y) => (
            <textarea {...a11y} value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} maxLength={2000} placeholder="مثال: الاسترجاع خلال 14 يوم والمنتج بحالته الأصلية." className={textareaClass} />
          )}
        </Field>
        <fieldset>
          <legend className="text-ui font-semibold">مدة الإرجاع بعد الاستلام</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((d) => (
              <ChoiceChip key={d} selected={returnDays === d} onClick={() => setReturnDays(d)}>
                {d === 0 ? 'مفيش إرجاع' : `${num(d)} يوم`}
              </ChoiceChip>
            ))}
          </div>
        </fieldset>
        <Status msg={msg} />
        <SubmitButton busy={busy} className="self-start">
          حفظ السياسات
        </SubmitButton>
      </form>
    </Panel>
  );
}

// ---------- Pickup ----------

export function PickupForm({ settings, governorates }: { settings: BrandSettings; governorates: Governorate[] }) {
  const { busy, msg, setMsg, save } = useSave();
  const p = settings.pickup;
  const [enabled, setEnabled] = useState(!!p?.enabled);
  const [address, setAddress] = useState(p?.address ?? '');
  const [gov, setGov] = useState(p?.governorate ?? '');
  const [hours, setHours] = useState(p?.hours ?? '');
  const [mapUrl, setMapUrl] = useState(p?.mapUrl ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const govId = useId();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    const map = mapUrl.trim() ? (/^https?:\/\//i.test(mapUrl.trim()) ? mapUrl.trim() : `https://${mapUrl.trim()}`) : '';
    if (enabled && !address.trim()) er.address = 'اكتب عنوان الاستلام';
    if (map && !/^https?:\/\/[^\s.]+\.\S+$/.test(map)) er.mapUrl = 'لينك مش صحيح';
    setErrors(er);
    if (Object.keys(er).length) return setMsg({ tone: 'danger', text: 'راجع الخانات المعلّمة بالأحمر.' });
    void save(
      { settings: { pickup: { enabled, address: address.trim(), governorate: gov || null, hours: hours.trim(), mapUrl: map || undefined } } },
      'اتحفظ الاستلام من المتجر',
    );
  };

  return (
    <Panel title="الاستلام من المتجر">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Toggle title="العميل يقدر يستلم من المتجر" body="العميل يطلب ويجي ياخد طلبه من غير شحن." checked={enabled} onChange={setEnabled} />
        <Field label="عنوان الاستلام" optional={!enabled} error={errors.address}>
          {(a11y) => (
            <textarea {...a11y} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} placeholder="مثال: 12 شارع التسعين، التجمع الخامس" className={cn(textareaClass, 'min-h-20')} />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={govId} label="المحافظة" optional>
            {(a11y) => (
              <select {...a11y} value={gov} onChange={(e) => setGov(e.target.value)} className={inputClass}>
                <option value="">من غير</option>
                {governorates.map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.ar}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <TextInput label="المواعيد" optional value={hours} onChange={setHours} maxLength={120} placeholder="يومياً من 12 الظهر لـ 10 بالليل" />
        </div>
        <TextInput label="لينك الخريطة" optional value={mapUrl} onChange={setMapUrl} type="url" ltr maxLength={500} placeholder="https://maps.app.goo.gl/..." error={errors.mapUrl} />
        <Status msg={msg} />
        <SubmitButton busy={busy} className="self-start">
          حفظ الاستلام
        </SubmitButton>
      </form>
    </Panel>
  );
}
