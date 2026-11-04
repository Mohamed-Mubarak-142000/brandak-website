import { num } from '@/lib/format';
import type { ProductDetail, SpecValue } from '@/lib/types';

type Spec = NonNullable<ProductDetail['specs']>[number];

export function specValue(value: SpecValue, unit: string | null) {
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  const v = typeof value === 'number' ? num(value) : value;
  return unit ? `${v} ${unit}` : v;
}

const hasValue = (s: Spec) => s.value !== '' && s.value !== null && s.value !== undefined;

/** Every spec as a two-column table (label, value + unit). */
export function SpecsTable({ specs }: { specs: Spec[] }) {
  const rows = specs.filter(hasValue);
  if (!rows.length) return null;
  return (
    <section aria-labelledby="specs-title">
      <h2 id="specs-title" className="text-section font-extrabold">
        المواصفات
      </h2>
      <table className="mt-3 w-full overflow-hidden rounded-panel border border-line text-ui">
        <tbody>
          {rows.map((s) => (
            <tr key={s.key} className="border-b border-line last:border-b-0 odd:bg-sunken/60">
              <th scope="row" className="w-2/5 px-4 py-2.5 text-start font-semibold text-ink-2">
                {s.label}
              </th>
              <td className="px-4 py-2.5">{specValue(s.value, s.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
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
        <div key={f.label} className="rounded-card border border-line bg-surface px-3 py-2">
          <dt className="text-meta text-ink-3">{f.label}</dt>
          <dd className="text-ui font-bold">{f.value}</dd>
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
