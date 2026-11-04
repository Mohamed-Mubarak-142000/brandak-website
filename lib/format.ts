import type { Governorate, ProductCard } from './types';

const egp = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 });

/** 450 → "٤٥٠ ج.م" — the app's price format. */
export const price = (n: number) => `${egp.format(n)} ج.م`;

export const num = (n: number) => egp.format(n);

/** 0.05 → "٥٪". */
export const percent = (rate: number) => `${egp.format(Math.round(rate * 1000) / 10)}٪`;

/** Discount shown on a product: the running sale, else the gap to compareAtPrice. */
export function discountPercent(p: Pick<ProductCard, 'price' | 'compareAtPrice' | 'sale'>) {
  if (p.sale?.percent) return p.sale.percent;
  if (p.compareAtPrice && p.compareAtPrice > p.price) return Math.round((1 - p.price / p.compareAtPrice) * 100);
  return 0;
}

/** Price before the discount, if there is one. */
export function originalPrice(p: Pick<ProductCard, 'price' | 'compareAtPrice' | 'sale'>) {
  if (p.compareAtPrice && p.compareAtPrice > p.price) return p.compareAtPrice;
  if (p.sale?.percent) return Math.round(p.price / (1 - p.sale.percent / 100));
  return null;
}

/**
 * Store and product descriptions are typed on a phone and may hold `**bold**` markers; the site
 * shows them as plain text.
 */
export const plainText = (s: string) => s.replace(/\*\*|__|`/g, '').replace(/^#+\s*/gm, '').trim();

/** First ~n characters on a word boundary, for meta descriptions. */
export function excerpt(s: string, n = 155) {
  const t = plainText(s).replace(/\s+/g, ' ');
  if (t.length <= n) return t;
  return `${t.slice(0, t.lastIndexOf(' ', n) > 0 ? t.lastIndexOf(' ', n) : n)}…`;
}

export const governorateName = (code: string, all: Governorate[]) => all.find((g) => g.code === code)?.ar ?? code;

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
export const date = (iso: string) => dateFmt.format(new Date(iso));
