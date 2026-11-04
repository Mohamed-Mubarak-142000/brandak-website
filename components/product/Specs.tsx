import { num } from '@/lib/format';
import type { ProductDetail, SpecValue } from '@/lib/types';

type Spec = NonNullable<ProductDetail['specs']>[number];

export function specValue(value: SpecValue, unit: string | null) {
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  const v = typeof value === 'number' ? num(value) : value;
  return unit ? `${v} ${unit}` : v;
}

const hasValue = (s: Spec) => s.value !== '' && s.value !== null && s.value !== undefined;

export const specRows = (specs: Spec[]) => specs.filter(hasValue);

/** Every spec as a two-column table (label, value + unit). `extra` rows go first (e.g. the category). */
export function SpecsTable({ specs, extra = [] }: { specs: Spec[]; extra?: Fact[] }) {
  const rows = [...extra, ...specRows(specs).map((s) => ({ label: s.label, value: specValue(s.value, s.unit) }))];
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-panel border border-line">
      <table className="w-full text-ui">
        <caption className="sr-only">مواصفات المنتج</caption>
        <tbody>
          {rows.map((s) => (
            <tr key={s.label} className="border-b border-line last:border-b-0 odd:bg-sunken">
              <th scope="row" className="w-2/5 px-4 py-3 text-start align-top font-semibold text-ink-2 sm:w-1/3 sm:px-5">
                {s.label}
              </th>
              <td className="px-4 py-3 font-semibold text-ink sm:px-5">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface Fact {
  label: string;
  value: string;
}

/** A few facts that matter most for this kind of store, as tiles near the price. */
export function KeyFacts({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.label} className="rounded-card bg-sunken px-3 py-2.5">
          <dt className="text-meta text-ink-3">{f.label}</dt>
          <dd className="mt-0.5 text-ui font-bold">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Specs whose key is in `keys`, in that order. */
export function pickFacts(specs: Spec[], keys: string[]): Fact[] {
  const out: Fact[] = [];
  for (const k of keys) {
    const s = specs.find((x) => x.key === k && hasValue(x));
    if (s) out.push({ label: s.label, value: specValue(s.value, s.unit) });
  }
  return out;
}
