import { num } from '@/lib/format';

/** Egyptian counting: "٢ براند"، "٥ براندات"، "١٢ براند". */
export function countOf(n: number, singular: string, plural: string) {
  return `${num(n)} ${n >= 3 && n <= 10 ? plural : singular}`;
}

/** "يوم"، "يومين"، "٣ أيام"، "١٤ يوم". */
export function days(n: number) {
  if (n === 1) return 'يوم';
  if (n === 2) return 'يومين';
  return countOf(n, 'يوم', 'أيام');
}
