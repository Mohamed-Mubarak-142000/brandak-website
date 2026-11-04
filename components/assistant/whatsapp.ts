/** Egyptian numbers as typed by sellers ("010…", "+20 10…") → a wa.me link. */
export function whatsappHref(raw?: string | null) {
  if (!raw) return null;
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = `20${d.slice(1)}`;
  else if (d.length === 10 && d.startsWith('1')) d = `20${d}`;
  return d.length >= 10 ? `https://wa.me/${d}` : null;
}
