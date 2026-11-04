'use client';

import { Archive, ChevronRight, LoaderCircle, Plus, Ruler, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Dialog } from '@/components/account/Dialog';
import { Panel } from '@/components/account/PageTitle';
import { Alert, btn, Field, inputClass, TextInput } from '@/components/auth/fields';
import { api } from '@/lib/client-api';
import { cn } from '@/lib/cn';
import { price as money } from '@/lib/format';
import type { Category } from '@/lib/types';

import { cellKey, categoryTree, combos, emptyCell, fallbackTemplate, num, productError, uniq, uploadProductImage, type Cells } from './helpers';
import { ImagesField, type Img } from './ImagesField';
import { SpecsFields, type SpecDraft } from './SpecsFields';
import type { AiStatus, BrandProduct, CategoryTemplate, MyBrandLite, ProductDraft, SpecValue } from './types';
import { Chip, ToggleRow } from './ui';
import { VariantBuilder } from './VariantBuilder';

const MAX_IMAGES = 10;
const PACK_UNITS = ['كرتونة', 'دستة', 'سيري', 'باكو', 'شوال', 'شيكارة', 'علبة'];

interface TierDraft {
  key: string;
  qty: string;
  price: string;
}
const rid = () => Math.random().toString(36).slice(2);
const newTier = (): TierDraft => ({ key: rid(), qty: '', price: '' });

/** Templates already fetched this visit, per category + store type. */
const templates = new Map<string, Promise<CategoryTemplate>>();
function loadTemplate(id: string, storeType: string) {
  const key = `${id}:${storeType}`;
  let p = templates.get(key);
  if (!p) {
    p = api.get<CategoryTemplate>(`categories/${id}/template?storeType=${storeType}`);
    p.catch(() => templates.delete(key));
    templates.set(key, p);
  }
  return p;
}

/**
 * Create / edit a product — the app's editor (src/app/seller/products/edit.tsx) on the web: photos
 * (with colour per photo), AI draft from photos, category → template (sizes, colours, specs, units),
 * variant matrix, prices, wholesale (required for warehouses), draft or publish, archive.
 * Limited-time sales and Excel import stay in the app.
 */
export function ProductForm({ product: p, brand, categories }: { product?: BrandProduct; brand: MyBrandLite; categories: Category[] }) {
  const router = useRouter();
  const id = p?._id;
  const storeType = brand.storeType;

  const tree = useMemo(() => categoryTree(categories), [categories]);
  const brandCats = brand.categoryIds ?? [];
  const ownLeaves = tree.leavesUnder(brandCats);
  const roots = brandCats.length && ownLeaves.length ? brandCats : [];
  const leaves = roots.length ? ownLeaves : tree.leavesUnder([]);

  const [images, setImages] = useState<Img[]>(() => p?.images.map((i) => ({ key: i.fileId, fileId: i.fileId, url: i.url, color: i.color || null })) ?? []);
  const [title, setTitle] = useState(p?.title ?? '');
  const [description, setDescription] = useState(p?.description ?? '');
  const initialCategory = p?.categoryId;
  const [pickedCategory, setCategoryId] = useState(p?.categoryId ?? '');
  const categoryId = pickedCategory || (leaves.length === 1 ? leaves[0]._id : '');

  // The category's template; while it loads (or with no category) free sizes and colours.
  const [tplState, setTplState] = useState<{ id: string; tpl: CategoryTemplate | null; failed?: boolean } | null>(null);
  useEffect(() => {
    if (!categoryId) return;
    let live = true;
    loadTemplate(categoryId, storeType).then(
      (tpl) => live && setTplState({ id: categoryId, tpl }),
      () => live && setTplState({ id: categoryId, tpl: null, failed: true }),
    );
    return () => {
      live = false;
    };
  }, [categoryId, storeType]);
  const tplLoading = !!categoryId && tplState?.id !== categoryId;
  const loaded = (tplState?.id === categoryId && tplState.tpl) || fallbackTemplate(storeType);
  const same = !!p && categoryId === initialCategory;
  const had = { sizes: uniq(p?.variants.map((v) => v.size) ?? []), colors: uniq(p?.variants.map((v) => v.color) ?? []) };
  const tpl: CategoryTemplate = {
    ...loaded,
    size: loaded.size ?? (same && had.sizes.length ? { label: 'المقاس', values: [], allowCustom: true } : null),
    color: loaded.color ?? (same && had.colors.length ? { label: 'اللون', allowCustom: true } : null),
  };

  const [price, setPrice] = useState(p ? String(p.price) : '');
  const [compareAt, setCompareAt] = useState(p?.compareAtPrice != null ? String(p.compareAtPrice) : '');
  const [sizes, setSizes] = useState<string[]>(() => had.sizes);
  const [colors, setColors] = useState<string[]>(() => had.colors);
  const [cells, setCells] = useState<Cells>(() => {
    const out: Cells = {};
    for (const v of p?.variants ?? []) out[cellKey(v.size?.trim() ?? '', v.color?.trim() ?? '')] = { id: v._id, stock: String(v.stock), price: v.price != null ? String(v.price) : '', sku: v.sku ?? '' };
    if (p) for (const c of combos(had.sizes, had.colors)) out[c.key] ??= { ...emptyCell(), stock: '0' };
    return out;
  });
  const activeSizes = tpl.size ? sizes : [];
  const activeColors = tpl.color ? colors : [];
  const variantList = combos(activeSizes, activeColors);
  const [specs, setSpecs] = useState<SpecDraft>(() => Object.fromEntries((p?.specs ?? []).map((x) => [x.key, typeof x.value === 'boolean' ? x.value : String(x.value)])));
  const [pickedUnit, setUnit] = useState(p?.unit ?? '');
  const unit = pickedUnit && tpl.units.includes(pickedUnit) ? pickedUnit : tpl.units[0];
  const [tags, setTags] = useState(p?.tags.join('، ') ?? '');

  const wsRequired = tpl.wholesale === 'required';
  const [wsToggle, setWsOn] = useState(!!p?.wholesale);
  const wsOn = wsRequired || wsToggle;
  const [packUnit, setPackUnit] = useState(p?.wholesale?.pack?.unit ?? '');
  const [packQty, setPackQty] = useState(p?.wholesale?.pack ? String(p.wholesale.pack.qty) : '');
  const packUnits = PACK_UNITS.filter((u) => u !== unit);
  const [wsMin, setWsMin] = useState(p?.wholesale ? String(p.wholesale.minQty) : '');
  const [tiers, setTiers] = useState<TierDraft[]>(() => (p?.wholesale?.tiers.length ? p.wholesale.tiers.map((x) => ({ key: rid(), qty: String(x.minQty), price: String(x.price) })) : [newTier()]));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<'ACTIVE' | 'DRAFT' | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger' | 'info'; text: string } | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [mountedAt] = useState(() => Date.now());

  // The copilot button floats above this page's action bar.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--seller-bottom-bar', '5.5rem');
    return () => {
      root.style.removeProperty('--seller-bottom-bar');
    };
  }, []);

  // ---------- Photos ----------
  const uploadAll = async (files: File[]) => {
    const added = files.map((file) => ({ file, img: { key: rid(), url: URL.createObjectURL(file), uploading: true, color: null } as Img }));
    setImages((xs) => [...xs, ...added.map((a) => a.img)]);
    const ids = await Promise.all(
      added.map(async ({ file, img: a }) => {
        try {
          const res = await uploadProductImage(file);
          setImages((xs) => xs.map((x) => (x.key === a.key ? { ...x, fileId: res.id, url: res.url ?? x.url, uploading: false } : x)));
          if (res.url) URL.revokeObjectURL(a.url);
          return res.id;
        } catch (e) {
          setNotice({ tone: 'danger', text: productError(e, 'معرفناش نرفع صورة. جرّب تاني.') });
          setImages((xs) => xs.filter((x) => x.key !== a.key));
          URL.revokeObjectURL(a.url);
          return null;
        }
      }),
    );
    return ids.filter((x): x is string => !!x);
  };

  // ---------- AI draft ----------
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [drafting, setDrafting] = useState(false);
  const aiInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (id) return;
    let live = true;
    api.get<AiStatus>('brand/ai/status').then(
      (s) => live && setAi(s),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [id]);

  const applyDraft = (d: ProductDraft) => {
    if (d.title) setTitle(d.title.slice(0, 120));
    if (d.description) setDescription(d.description.slice(0, 5000));
    if (d.categoryId && tree.byId.has(d.categoryId)) setCategoryId(d.categoryId);
    if (d.tags.length) setTags(d.tags.join('، '));
    if (d.suggestedPrice && !num(price)) setPrice(String(d.suggestedPrice));
    const nextSizes = uniq(d.sizes).slice(0, 12);
    const nextColors = uniq(d.colors).slice(0, 8);
    setSizes(nextSizes);
    setColors(nextColors);
    setCells((current) => {
      const next = { ...current };
      for (const c of combos(nextSizes, nextColors)) next[c.key] ??= { ...emptyCell(), stock: '10' };
      return next;
    });
  };

  const runDraft = async (fileIds: string[]) => {
    setDrafting(true);
    setNotice(null);
    try {
      const d = await api.post<ProductDraft>('brand/ai/product-draft', { imageFileIds: fileIds.slice(0, 3) });
      applyDraft(d);
      setAi((s) => (s ? { ...s, remaining: Math.max(0, s.remaining - 1) } : s));
      setNotice({ tone: 'success', text: d.suggestedPrice ? 'كل البيانات اتملت. راجع السعر والمخزون قبل النشر.' : 'البيانات اتملت. اكتب السعر وراجع المخزون.' });
    } catch (e) {
      setNotice({ tone: 'danger', text: productError(e) });
      api.get<AiStatus>('brand/ai/status').then(setAi, () => undefined);
    } finally {
      setDrafting(false);
    }
  };

  const startDraft = () => {
    const ids = images.filter((i) => i.fileId).map((i) => i.fileId!);
    if (ids.length) void runDraft(ids);
    else aiInput.current?.click();
  };

  // ---------- Validation & save ----------
  const validate = (publish: boolean) => {
    const e: Record<string, string> = {};
    if (title.trim().length < 2) e.title = 'اسم المنتج حرفين على الأقل';
    if (!categoryId) e.category = 'اختار القسم';
    else if (categoryId !== initialCategory && !tree.isLeaf(categoryId)) e.category = 'اختار قسم فرعي أدق';
    for (const s of tpl.specs) {
      const v = specs[s.key];
      const filled = typeof v === 'boolean' || (typeof v === 'string' && v.trim() !== '');
      if (publish && s.required && !filled) e[`spec:${s.key}`] = `اكتب ${s.labelAr}`;
      else if (s.type === 'number' && typeof v === 'string' && v.trim() && num(v) == null) e[`spec:${s.key}`] = 'اكتب رقم';
    }
    if (publish && !images.length) e.images = 'ضيف صورة واحدة على الأقل عشان المنتج يتنشر، أو احفظه كمسودة';
    const pr = num(price);
    if (!pr || pr < 1) e.price = 'السعر لازم يكون 1 جنيه أو أكتر';
    const c = num(compareAt);
    if (c != null && pr != null && c <= pr) e.compareAt = 'لازم يكون أكبر من السعر';
    if (variantList.length > 100) e.variants = 'لحد 100 اختيار للمنتج، قلّل المقاسات أو الألوان';
    else if (variantList.some((v) => num(cells[v.key]?.stock ?? '') == null || num(cells[v.key]!.stock)! < 0)) e.variants = 'اكتب الكمية لكل اختيار (0 لو خلص)';
    else if (variantList.some((v) => cells[v.key]?.price.trim() && !(num(cells[v.key]!.price)! >= 0))) e.variants = 'السعر المختلف لازم يكون رقم';
    if (wsOn) {
      const filled = tiers.filter((x) => x.qty.trim() || x.price.trim());
      const pack = num(packQty);
      if (packUnit && (!pack || pack < 2)) e.wholesale = `اكتب عدد ${unit === 'قطعة' ? 'القطع' : unit} في الـ${packUnit}`;
      if (wsRequired && publish && !filled.length && !packUnit && (num(wsMin) ?? 1) <= 1) e.wholesale = 'المخازن لازم تحدد سعر جملة أو وحدة جملة (كرتونة مثلاً) قبل النشر';
      const sorted = filled.map((x) => ({ q: num(x.qty) ?? 0, pr: num(x.price) ?? 0 })).sort((a, b) => a.q - b.q);
      if (e.wholesale) {
        // Already explained.
      } else if (num(wsMin) == null || num(wsMin)! < 1) e.wholesale = 'اكتب أقل كمية للطلب';
      else if (sorted.some((x) => x.q < 2 || x.pr < 1)) e.wholesale = 'كل سعر جملة محتاج كمية (2 أو أكتر) وسعر';
      else if (sorted.some((x, i) => x.pr >= (pr ?? 0) || (i > 0 && (x.q === sorted[i - 1].q || x.pr >= sorted[i - 1].pr)))) {
        e.wholesale = 'كل ما الكمية تزيد السعر يقل، وكله أقل من السعر العادي';
      }
    }
    if (images.some((i) => i.uploading)) e.images = 'استنى الصور تخلص رفع';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const body = (publish: boolean) => ({
    title: title.trim(),
    description: description.trim(),
    categoryId,
    price: num(price),
    compareAtPrice: num(compareAt) ?? null,
    wholesale: wsOn
      ? {
          minQty: Math.round(num(wsMin) ?? 1),
          tiers: tiers.filter((x) => num(x.qty) && num(x.price)).map((x) => ({ minQty: Math.round(num(x.qty)!), price: num(x.price)! })),
          pack: packUnit && num(packQty) ? { unit: packUnit, qty: Math.round(num(packQty)!) } : null,
        }
      : null,
    unit,
    specs: tpl.specs.flatMap((s): { key: string; value: SpecValue }[] => {
      const v = specs[s.key];
      if (typeof v === 'boolean') return s.type === 'boolean' ? [{ key: s.key, value: v }] : [];
      if (!v?.trim()) return [];
      return [{ key: s.key, value: s.type === 'number' ? num(v)! : v.trim() }];
    }),
    imageFileIds: images.filter((i) => i.fileId).map((i) => i.fileId!),
    imageColors: images.filter((i) => i.fileId).map((i) => (i.color && activeColors.includes(i.color) ? i.color : '')),
    variants: variantList.map((c) => {
      const cell = cells[c.key] ?? emptyCell();
      return {
        id: cell.id,
        size: c.size || undefined,
        color: c.color || undefined,
        sku: cell.sku.trim() || undefined,
        price: num(cell.price) ?? null,
        stock: Math.round(num(cell.stock) ?? 0),
      };
    }),
    tags: tags
      .split(/[,،]/)
      .map((x) => x.trim().slice(0, 30))
      .filter(Boolean)
      .slice(0, 20),
    status: publish ? 'ACTIVE' : 'DRAFT',
  });

  const save = async (publish: boolean) => {
    setServerError(null);
    if (!validate(publish)) {
      // Move to the first field that needs attention.
      requestAnimationFrame(() => {
        const bad = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
        bad?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (bad && 'focus' in bad && bad.matches('input,select,textarea')) bad.focus({ preventScroll: true });
      });
      return;
    }
    setSaving(publish ? 'ACTIVE' : 'DRAFT');
    try {
      const saved = id ? await api.patch<BrandProduct>(`brand/products/${id}`, body(publish)) : await api.post<BrandProduct>('brand/products', body(publish));
      router.push(`/seller/products?saved=${saved.status === 'ACTIVE' ? 'active' : 'draft'}`);
      router.refresh();
    } catch (e) {
      setServerError(productError(e, 'معرفناش نحفظ المنتج. جرّب تاني.'));
      setSaving(null);
    }
  };

  const archive = async () => {
    if (!id) return;
    setArchiving(true);
    try {
      await api.delete(`brand/products/${id}`);
      router.push('/seller/products?saved=archived');
      router.refresh();
    } catch (e) {
      setArchiveOpen(false);
      setServerError(productError(e));
      setArchiving(false);
    }
  };

  const specErrors = Object.fromEntries(Object.entries(errors).flatMap(([k, v]) => (k.startsWith('spec:') ? [[k.slice(5), v]] : [])));
  const liveSale = p?.sale && new Date(p.sale.endsAt).getTime() > mountedAt ? p.sale : null;
  const isActive = p?.status === 'ACTIVE';
  const ids = { desc: useId(), cat: useId(), tags: useId(), wsMin: useId(), pack: useId() };
  const leafGroups = useMemo(() => {
    const out = new Map<string, { id: string; label: string }[]>();
    for (const c of leaves) {
      const path = tree.path(c._id).split(' › ');
      const group = path.length > 1 ? path[0] : 'أقسام';
      out.set(group, [...(out.get(group) ?? []), { id: c._id, label: path.slice(path.length > 1 ? 1 : 0).join(' › ') }]);
    }
    return [...out.entries()];
  }, [leaves, tree]);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void save(true);
      }}
      className="flex flex-col gap-5 pb-4"
    >
      <Link href="/seller/products" className="inline-flex min-h-11 w-fit items-center gap-1 text-ui font-bold text-ink-2 hover:text-accent">
        <ChevronRight aria-hidden className="size-4" />
        كل المنتجات
      </Link>

      <div aria-live="polite">{notice ? <Alert tone={notice.tone} title={notice.text} /> : null}</div>

      {!id && ai?.enabled ? (
        <Panel className="border-brand/30 bg-accent-soft/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Sparkles aria-hidden className="hidden size-8 shrink-0 text-accent sm:block" />
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">اعمل المنتج من صورة</h2>
              <p className="mt-0.5 text-ui text-ink-2">
                ارفع لحد 3 صور للمنتج من زوايا مختلفة والذكاء الاصطناعي يملالك: الاسم، الوصف، القسم، المقاسات والألوان، كلمات البحث، وسعر مقترح. انت بس تراجع.
              </p>
              <p className="mt-1 text-meta font-bold text-accent">{ai.remaining > 0 ? `باقي النهارده ${ai.remaining} من ${ai.dailyLimit} محاولة` : 'خلصت محاولات النهارده، جرّب بكرة'}</p>
            </div>
            <button type="button" onClick={startDraft} disabled={drafting || !ai.remaining || images.some((i) => i.uploading)} className={cn(btn.primary, 'shrink-0')}>
              {drafting ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
              {images.some((i) => i.fileId) ? 'املا البيانات من الصور' : 'اختار صور المنتج'}
            </button>
            <input
              ref={aiInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              multiple
              hidden
              onChange={async (e) => {
                const files = [...(e.target.files ?? [])].slice(0, Math.min(3, MAX_IMAGES - images.length));
                e.target.value = '';
                if (!files.length) return;
                setDrafting(true);
                const uploaded = await uploadAll(files);
                if (uploaded.length) await runDraft(uploaded);
                else setDrafting(false);
              }}
            />
          </div>
          {drafting ? (
            <p role="status" className="mt-3 text-meta text-ink-2">
              بنقرا الصور ونكتب البيانات... ممكن ياخد لحد نص دقيقة.
            </p>
          ) : null}
        </Panel>
      ) : null}

      <Panel>
        <ImagesField
          images={images}
          max={MAX_IMAGES}
          colors={activeColors}
          error={errors.images}
          onAdd={(files) => void uploadAll(files)}
          onChange={(next) => setImages(next)}
        />
      </Panel>

      <Panel title="البيانات الأساسية">
        <div className="flex flex-col gap-4">
          <TextInput label="اسم المنتج" placeholder="مثال: تيشيرت قطن أوفرسايز" value={title} onChange={setTitle} maxLength={120} error={errors.title} />
          <Field id={ids.desc} label="الوصف" optional hint={`${description.length}/5000 — الخامة، المقاسات، طريقة الاستخدام أو الغسيل...`}>
            {(a11y) => (
              <textarea
                {...a11y}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="الخامة، المقاسات، طريقة الغسيل..."
                className={cn(inputClass, 'min-h-32 py-3 leading-relaxed')}
              />
            )}
          </Field>

          {leaves.length === 1 && categoryId === leaves[0]._id ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-sunken px-3.5 py-2.5 text-ui">
              <span>
                القسم: <b>{tree.path(categoryId)}</b>
              </span>
              <span className="text-meta text-ink-3">من إعدادات المتجر</span>
            </div>
          ) : (
            <Field id={ids.cat} label="القسم" error={errors.category} hint="القسم بيحدد المقاسات والمواصفات اللي هتكتبها، وبيساعد العميل يلاقي المنتج">
              {(a11y) => (
                <select {...a11y} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={cn(inputClass, 'cursor-pointer')}>
                  <option value="">اختار القسم</option>
                  {initialCategory && !leaves.some((l) => l._id === initialCategory) ? <option value={initialCategory}>{tree.path(initialCategory) || 'القسم الحالي'}</option> : null}
                  {leafGroups.map(([group, opts]) => (
                    <optgroup key={group} label={group}>
                      {opts.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </Field>
          )}
          {tplState?.failed && tplState.id === categoryId ? <Alert tone="warning" title="معرفناش نجيب مواصفات القسم ده. تقدر تكمّل، وجرّب تحدّث الصفحة." /> : null}

          {categoryId ? (
            tplLoading ? (
              <div aria-busy className="h-24 animate-pulse rounded-card bg-skeleton" />
            ) : (
              <SpecsFields specs={tpl.specs} values={specs} onChange={setSpecs} errors={specErrors} />
            )
          ) : null}
        </div>
      </Panel>

      <Panel title="السعر">
        <div className="flex flex-col gap-4">
          {tpl.units.length > 1 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-ui font-semibold">بيتباع بـ</legend>
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {tpl.units.map((u) => (
                  <Chip key={u} role="radio" selected={unit === u} onClick={() => setUnit(u)}>
                    {u}
                  </Chip>
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label={unit === 'قطعة' ? 'السعر (ج.م)' : `سعر الـ${unit} (ج.م)`} placeholder="مثال: 350" value={price} onChange={setPrice} inputMode="decimal" ltr error={errors.price} />
            <TextInput label="السعر قبل الخصم" placeholder="مثال: 450" optional value={compareAt} onChange={setCompareAt} inputMode="decimal" ltr error={errors.compareAt} />
          </div>
          {liveSale ? (
            <Alert tone="info" title={`عليه عرض ${liveSale.percent}٪ شغال لحد ${new Date(liveSale.endsAt).toLocaleDateString('ar-EG')}`}>
              العروض المحدودة بتتعدّل من تطبيق فاترينة، والحفظ هنا مش هيلغي العرض.
            </Alert>
          ) : null}
        </div>
      </Panel>

      <Panel title={`${[tpl.size?.label, tpl.color?.label].filter(Boolean).join(' و') || 'الكمية'}${tpl.size || tpl.color ? ' والكميات' : ''}`}>
        {tplLoading ? (
          <div aria-busy className="h-32 animate-pulse rounded-card bg-skeleton" />
        ) : (
          <VariantBuilder
            key={categoryId || 'none'}
            template={tpl}
            sizes={activeSizes}
            colors={activeColors}
            cells={cells}
            onSizes={setSizes}
            onColors={setColors}
            onCells={setCells}
            unit={unit}
            error={errors.variants}
          />
        )}
        {tpl.sizeGuide ? (
          <div className="mt-4 rounded-card bg-sunken p-3">
            <p className="flex items-center justify-between gap-2 text-ui font-semibold">
              دليل المقاسات
              <Ruler aria-hidden className="size-4 text-ink-3" />
            </p>
            <p className="mt-1 whitespace-pre-line text-meta text-ink-2">{tpl.sizeGuide}</p>
            <p className="mt-1 text-meta text-ink-3">بيظهر للعميل في صفحة المنتج</p>
          </div>
        ) : null}
      </Panel>

      <section aria-label="أسعار الجملة" className="flex flex-col gap-3">
        {wsRequired ? (
          <div className="rounded-card border border-brand bg-surface p-3.5">
            <p className="font-bold">أسعار الجملة</p>
            <p className="text-meta text-ink-3">أساسية للمخازن: العميل يشتري قطاعي بالسعر العادي، وكل ما الكمية تزيد السعر يقل.</p>
          </div>
        ) : (
          <ToggleRow title="أسعار الجملة" note="أقل كمية للطلب، وسعر أقل كل ما الكمية تزيد (كل المقاسات بتتحسب مع بعض)" checked={wsOn} onChange={setWsOn} />
        )}
        {wsOn ? (
          <Panel>
            <div className="flex flex-col gap-4">
              <TextInput
                id={ids.wsMin}
                label={`أقل كمية للطلب (${unit})`}
                placeholder={wsRequired ? '1' : 'مثال: 6'}
                value={wsMin}
                onChange={setWsMin}
                inputMode="numeric"
                ltr
                hint={wsRequired ? 'اكتب 1 لو بتبيع قطاعي كمان' : 'اكتب 1 لو مفيش حد أدنى'}
              />
              <fieldset>
                <legend className="mb-2 text-ui font-semibold">وحدة الجملة</legend>
                <div role="radiogroup" className="flex flex-wrap gap-2">
                  <Chip role="radio" selected={!packUnit} onClick={() => setPackUnit('')}>
                    من غير
                  </Chip>
                  {packUnits.map((u) => (
                    <Chip key={u} role="radio" selected={packUnit === u} onClick={() => setPackUnit(u)}>
                      {u}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              {packUnit ? (
                <TextInput
                  id={ids.pack}
                  label={`كام ${unit} في الـ${packUnit}؟`}
                  placeholder="مثال: 24"
                  value={packQty}
                  onChange={setPackQty}
                  inputMode="numeric"
                  ltr
                  hint={num(packQty) && num(price) ? `سعر الـ${packUnit} بالسعر العادي: ${money(Math.round(num(packQty)! * num(price)!))}` : undefined}
                />
              ) : null}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-ui font-semibold">أسعار الكميات</legend>
                {tiers.map((x, i) => (
                  <div key={x.key} className="flex items-end gap-2">
                    <label className="flex min-w-0 flex-1 flex-col gap-1 text-meta text-ink-2">
                      من كمية
                      <input
                        inputMode="numeric"
                        dir="ltr"
                        placeholder="12"
                        value={x.qty}
                        onChange={(e) => setTiers((xs) => xs.map((y) => (y.key === x.key ? { ...y, qty: e.target.value } : y)))}
                        aria-label={`الكمية للسعر ${i + 1}`}
                        className={cn(inputClass, 'min-h-11 text-start')}
                      />
                    </label>
                    <label className="flex min-w-0 flex-1 flex-col gap-1 text-meta text-ink-2">
                      سعر الـ{unit}
                      <input
                        inputMode="decimal"
                        dir="ltr"
                        placeholder="80"
                        value={x.price}
                        onChange={(e) => setTiers((xs) => xs.map((y) => (y.key === x.key ? { ...y, price: e.target.value } : y)))}
                        aria-label={`سعر الـ${unit} للسعر ${i + 1}`}
                        className={cn(inputClass, 'min-h-11 text-start')}
                      />
                    </label>
                    {tiers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setTiers((xs) => xs.filter((y) => y.key !== x.key))}
                        aria-label={`حذف السعر ${i + 1}`}
                        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-danger hover:bg-danger-soft"
                      >
                        <Trash2 aria-hidden className="size-5" />
                      </button>
                    ) : null}
                  </div>
                ))}
                {tiers.length < 3 ? (
                  <button type="button" onClick={() => setTiers((xs) => [...xs, newTier()])} className={cn(btn.quiet, 'self-start')}>
                    <Plus aria-hidden className="size-4" />
                    سعر لكمية أكبر
                  </button>
                ) : null}
              </fieldset>
              {errors.wholesale ? (
                <p role="alert" className="text-meta font-semibold text-danger">
                  {errors.wholesale}
                </p>
              ) : null}
            </div>
          </Panel>
        ) : null}
      </section>

      <Panel>
        <TextInput id={ids.tags} label="كلمات مفتاحية" optional value={tags} onChange={setTags} placeholder="صيفي، قطن، أوفرسايز" hint="افصل بينها بفاصلة — بتساعد في البحث" />
      </Panel>

      {/* Actions stay in reach while scrolling a long form. */}
      <div className="sticky bottom-2 z-10 rounded-panel border border-line bg-surface/95 p-3 shadow-pop backdrop-blur">
        <div aria-live="assertive">{serverError ? <Alert title={serverError} className="mb-3" /> : null}</div>
        {Object.keys(errors).length ? (
          <p className="mb-2 text-meta font-semibold text-danger">فيه {Object.keys(errors).length === 1 ? 'حقل محتاج' : 'حقول محتاجة'} مراجعة — متعلّم عليها بالأحمر.</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={!!saving} aria-busy={saving === 'ACTIVE' || undefined} className={cn(btn.primary, 'flex-1 sm:flex-none')}>
            {saving === 'ACTIVE' ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
            {isActive ? 'احفظ التعديلات' : 'احفظ وانشر'}
          </button>
          <button type="button" disabled={!!saving} onClick={() => void save(false)} aria-busy={saving === 'DRAFT' || undefined} className={cn(btn.secondary, 'flex-1 sm:flex-none')}>
            {saving === 'DRAFT' ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
            {isActive ? 'خلّيه مسودة' : 'احفظ كمسودة'}
          </button>
          {id && p?.status !== 'ARCHIVED' ? (
            <button type="button" onClick={() => setArchiveOpen(true)} className={cn(btn.quiet, 'ms-auto text-danger')}>
              <Archive aria-hidden className="size-4" />
              أرشفة
            </button>
          ) : null}
        </div>
      </div>

      <Dialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="أرشفة المنتج؟"
        footer={
          <>
            <button type="button" className={btn.secondary} onClick={() => setArchiveOpen(false)}>
              إلغاء
            </button>
            <button type="button" className={btn.danger} disabled={archiving} onClick={() => void archive()}>
              {archiving ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
              أرشفة
            </button>
          </>
        }
      >
        <p className="text-ui text-ink-2">هيختفي من المتجر. المنتجات اللي عليها طلبات بتتأرشف بدل ما تتمسح، وتقدر ترجّعه من «مؤرشف».</p>
      </Dialog>
    </form>
  );
}
