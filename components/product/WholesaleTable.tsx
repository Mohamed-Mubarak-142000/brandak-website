import { Boxes } from 'lucide-react';

import { num, price } from '@/lib/format';
import type { Wholesale } from '@/lib/types';

/** Quantity pricing for warehouse products: base price, then each cheaper tier. */
export function WholesaleTable({ wholesale, basePrice, unit = 'قطعة' }: { wholesale: Wholesale; basePrice: number; unit?: string }) {
  const minQty = wholesale.minQty > 1 ? wholesale.minQty : null;
  const start = minQty ?? 1;
  // The base price starts at one piece, or at the minimum order when there is one.
  const tiers = [...(wholesale.tiers ?? [])].filter((t) => t.minQty > start).sort((a, b) => a.minQty - b.minQty);
  const rows = [{ minQty: start, price: basePrice }, ...tiers];

  return (
    <section aria-labelledby="wholesale-title" className="rounded-panel border border-success/30 bg-success-soft p-4 sm:p-5">
      <h2 id="wholesale-title" className="flex items-center gap-2 text-body font-extrabold text-success">
        <Boxes aria-hidden className="size-5" />
        كل ما تزوّد الكمية السعر يقل
      </h2>

      {rows.length > 1 || minQty ? (
        <table className="mt-3 w-full text-ui">
          <caption className="sr-only">سعر ال{unit} حسب الكمية</caption>
          <thead>
            <tr className="text-meta text-ink-2">
              <th scope="col" className="pb-2 text-start font-semibold">
                الكمية
              </th>
              <th scope="col" className="pb-2 text-end font-semibold">
                سعر ال{unit}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.minQty} className="border-t border-success/20">
                <th scope="row" className="py-2 text-start font-semibold">
                  {r.minQty === 1 ? `${num(1)} ${unit}` : `من ${num(r.minQty)} ${unit}`}
                </th>
                <td className="py-2 text-end">
                  <span className="font-bold">{price(r.price)}</span>
                  {i > 0 && r.price < basePrice ? (
                    <span className="ms-2 text-meta font-semibold text-success">وفّر {num(Math.round((1 - r.price / basePrice) * 100))}٪</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <ul className="mt-3 space-y-1 text-ui text-ink-2">
        {wholesale.pack?.unit && wholesale.pack.qty > 1 ? (
          <li>
            بيتباع {wholesale.pack.unit} فيها {num(wholesale.pack.qty)} {unit}
          </li>
        ) : null}
        {minQty ? (
          <li>
            أقل كمية للطلب <strong className="text-ink">{num(minQty)} {unit}</strong>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
