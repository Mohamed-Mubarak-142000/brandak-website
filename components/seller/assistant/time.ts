const n = new Intl.NumberFormat('ar-EG');
const day = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' });
const clock = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' });

/** "دلوقتي" / "من ٥ دقايق" / "من ٣ ساعات" / "١٢ أكتوبر", relative to `now`. */
export function ago(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'دلوقتي';
  if (min < 60) return min === 1 ? 'من دقيقة' : min === 2 ? 'من دقيقتين' : `من ${n.format(min)} دقايق`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? 'من ساعة' : h === 2 ? 'من ساعتين' : `من ${n.format(h)} ساعات`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'امبارح';
  if (d < 7) return `من ${n.format(d)} أيام`;
  return day.format(new Date(iso));
}

export const timeOf = (iso: string) => clock.format(new Date(iso));
export const dayOf = (iso: string) => day.format(new Date(iso));

/** The time a server render happened (so relative times match between server and browser). */
export const requestTime = () => Date.now();
