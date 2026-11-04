'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { inputClass } from '@/components/auth/fields';
import { swatch } from '@/components/product/colors';
import { cn } from '@/lib/cn';
import { latinDigits } from '@/components/auth/validation';

import { combos, emptyCell, type Cell, type Cells } from './helpers';
import type { CategoryTemplate } from './types';
import { Chip, Switch } from './ui';

/** Colours most products come in, offered as one-tap swatches. */
const COMMON_COLORS = ['أسود', 'أبيض', 'أوف وايت', 'رمادي', 'كحلي', 'أزرق', 'لبني', 'أحمر', 'نبيتي', 'وردي', 'بيج', 'بني', 'جملي', 'أخضر', 'زيتي', 'أصفر', 'برتقالي', 'بنفسجي', 'دهبي', 'فضي'];

const smallInput = cn(inputClass, 'min-h-11 text-start [unicode-bidi:plaintext]');

const rank = (choices: string[], v: string) => {
  const i = choices.indexOf(v);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
};

/**
 * Sizes and colours from the category template as chips, then a quantity (and an optional own
 * price / SKU) for each combination — the app's variant builder.
 */
export function VariantBuilder({
  template,
  sizes,
  colors,
  cells,
  onSizes,
  onColors,
  onCells,
  unit,
  error,
}: {
  template: Pick<CategoryTemplate, 'size' | 'color'>;
  sizes: string[];
  colors: string[];
  cells: Cells;
  onSizes: (s: string[]) => void;
  onColors: (c: string[]) => void;
  onCells: (c: Cells) => void;
  unit: string;
  error?: string;
}) {
  const [ownPrices, setOwnPrices] = useState(() => Object.values(cells).some((c) => c.price.trim()));
  const [skus, setSkus] = useState(() => Object.values(cells).some((c) => c.sku.trim()));
  const [fill, setFill] = useState('');
  const fillId = useId();
  const errorId = useId();
  const sizeAxis = template.size;
  const colorAxis = template.color;
  const sizeChoices = sizeAxis ? [...new Set([...sizeAxis.values, ...sizes])] : sizes;
  const colorChoices = colorAxis ? [...new Set([...COMMON_COLORS, ...colors])] : colors;
  const list = combos(sizes, colors);
  const pieces = unit === 'قطعة' ? 'القطع' : `الـ${unit}`;

  const toggle = (value: string, current: string[], choices: string[], set: (v: string[]) => void) => {
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    set(next.sort((a, b) => rank(choices, a) - rank(choices, b)));
  };
  const setCell = (key: string, patch: Partial<Cell>) => onCells({ ...cells, [key]: { ...(cells[key] ?? emptyCell()), ...patch } });
  const fillAll = () => {
    const n = latinDigits(fill).trim();
    if (!n) return;
    onCells({ ...cells, ...Object.fromEntries(list.map((c) => [c.key, { ...(cells[c.key] ?? emptyCell()), stock: n }])) });
  };

  const groups = colors.length ? colors.map((color) => ({ color, items: list.filter((c) => c.color === color) })) : [{ color: '', items: list }];

  return (
    <div className="flex flex-col gap-5">
      {sizeAxis ? (
        <AxisPicker
          label={sizeAxis.label}
          hint={sizeAxis.values.length ? `اختار كل ${sizeAxis.label} المتاحة عندك` : `اكتب ${sizeAxis.label} واضغط إضافة`}
          choices={sizeChoices}
          selected={sizes}
          allowCustom={sizeAxis.allowCustom}
          onToggle={(v) => toggle(v, sizes, sizeChoices, onSizes)}
          onAdd={(v) => !sizes.includes(v) && onSizes([...sizes, v])}
        />
      ) : null}
      {colorAxis ? (
        <AxisPicker
          label={colorAxis.label}
          hint="اختار الألوان المتاحة، أو سيبها فاضية لو لون واحد"
          choices={colorChoices}
          selected={colors}
          allowCustom={colorAxis.allowCustom}
          swatches
          onToggle={(v) => toggle(v, colors, colorChoices, onColors)}
          onAdd={(v) => !colors.includes(v) && onColors([...colors, v])}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="font-bold">{list.length > 1 ? `الكميات (${list.length} اختيار)` : 'الكمية المتاحة'}</p>
        <p id={errorId} className={cn('text-meta', error ? 'font-semibold text-danger' : 'text-ink-3')} role={error ? 'alert' : undefined}>
          {error ?? (list.length > 1 ? `اكتب عدد ${pieces} المتاحة من كل اختيار. 0 = خلص، والعميل يقدر يطلب تنبيه لما يرجع.` : `عدد ${pieces} اللي عندك`)}
        </p>

        {list.length > 3 ? (
          <div className="flex items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor={fillId} className="text-ui font-semibold">
                نفس الكمية للكل
              </label>
              <input id={fillId} inputMode="numeric" dir="ltr" value={fill} onChange={(e) => setFill(e.target.value)} placeholder="مثال: 10" className={smallInput} />
            </div>
            <button type="button" onClick={fillAll} className="min-h-11 cursor-pointer rounded-full bg-accent-soft px-5 text-ui font-bold text-accent hover:bg-accent hover:text-on-accent">
              تطبيق
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <fieldset key={g.color || 'all'} className="min-w-0 rounded-card border border-line bg-surface p-3">
              {g.color ? (
                <legend className="flex items-center gap-2 px-1 text-ui font-bold">
                  {swatch(g.color) ? <span aria-hidden className="size-4 rounded-full border border-line-strong" style={{ backgroundColor: swatch(g.color)! }} /> : null}
                  {g.color}
                </legend>
              ) : (
                <legend className="sr-only">الكميات</legend>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {g.items.map((c) => {
                  const label = c.size || (c.color ? 'الكمية' : `الكمية (${unit})`);
                  const who = [c.size, c.color].filter(Boolean).join(' / ');
                  return (
                    <div key={c.key} className="flex flex-wrap items-end gap-2">
                      <label className="flex min-w-24 flex-1 flex-col gap-1 text-ui font-semibold">
                        {label}
                        <input
                          inputMode="numeric"
                          dir="ltr"
                          value={cells[c.key]?.stock ?? ''}
                          onChange={(e) => setCell(c.key, { stock: e.target.value })}
                          placeholder="0"
                          aria-label={who ? `الكمية: ${who}` : undefined}
                          aria-invalid={error && !cells[c.key]?.stock?.trim() ? true : undefined}
                          aria-describedby={errorId}
                          className={smallInput}
                        />
                      </label>
                      {ownPrices ? (
                        <label className="flex min-w-24 flex-1 flex-col gap-1 text-ui font-semibold">
                          <span>
                            سعر مختلف <span className="font-normal text-ink-3">(اختياري)</span>
                          </span>
                          <input
                            inputMode="decimal"
                            dir="ltr"
                            value={cells[c.key]?.price ?? ''}
                            onChange={(e) => setCell(c.key, { price: e.target.value })}
                            placeholder="نفس السعر"
                            aria-label={who ? `سعر مختلف: ${who}` : undefined}
                            className={smallInput}
                          />
                        </label>
                      ) : null}
                      {skus ? (
                        <label className="flex w-full flex-col gap-1 text-ui font-semibold">
                          SKU
                          <input
                            dir="ltr"
                            maxLength={60}
                            value={cells[c.key]?.sku ?? ''}
                            onChange={(e) => setCell(c.key, { sku: e.target.value })}
                            aria-label={who ? `SKU: ${who}` : undefined}
                            className={cn(smallInput, 'uppercase')}
                          />
                        </label>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-card border border-line px-3.5 py-2.5">
          <span className="min-w-0 flex-1 text-ui">{list.length > 1 ? 'بعض الاختيارات بسعر مختلف' : 'سعر مختلف'}</span>
          <Switch checked={ownPrices} onChange={setOwnPrices} label="أسعار مختلفة للاختيارات" />
        </div>
        <div className="flex items-center gap-3 rounded-card border border-line px-3.5 py-2.5">
          <span className="min-w-0 flex-1 text-ui">أكواد SKU للمخزن</span>
          <Switch checked={skus} onChange={setSkus} label="أكواد SKU" />
        </div>
      </div>
    </div>
  );
}

function AxisPicker({
  label,
  hint,
  choices,
  selected,
  allowCustom,
  swatches,
  onToggle,
  onAdd,
}: {
  label: string;
  hint: string;
  choices: string[];
  selected: string[];
  allowCustom: boolean;
  swatches?: boolean;
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
}) {
  const [custom, setCustom] = useState('');
  const customId = useId();
  const add = () => {
    const v = custom.trim().slice(0, 30);
    if (!v) return;
    onAdd(v);
    setCustom('');
  };
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="font-bold">
        {label}
        {selected.length ? <span className="ms-1 text-meta text-accent">({selected.length})</span> : null}
      </legend>
      <p className="text-meta text-ink-3">{hint}</p>
      {choices.length ? (
        <div className="flex flex-wrap gap-2">
          {choices.map((v) => (
            <Chip key={v} selected={selected.includes(v)} onClick={() => onToggle(v)} swatch={swatches ? swatch(v) : undefined}>
              {v}
            </Chip>
          ))}
        </div>
      ) : null}
      {allowCustom ? (
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor={customId} className="text-meta text-ink-2">
              {label} مش في القائمة؟
            </label>
            <input
              id={customId}
              value={custom}
              maxLength={30}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
              placeholder="اكتبه هنا"
              className={cn(inputClass, 'min-h-11')}
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!custom.trim()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full border border-line-strong bg-surface px-4 text-ui font-bold hover:border-brand hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus aria-hidden className="size-4" />
            إضافة
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}
