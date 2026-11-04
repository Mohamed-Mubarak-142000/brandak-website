/**
 * Stores name colours in Arabic (or English); this turns the common ones into a swatch colour.
 * Unknown names get no swatch and show as text only.
 */
const SWATCHES: [RegExp, string][] = [
  [/^(أبيض|ابيض|اوف وايت|أوف وايت|white|off ?white)/i, '#ffffff'],
  [/^(أسود|اسود|black)/i, '#1d1a18'],
  [/^(كحلي|كحلى|navy)/i, '#1f2a44'],
  [/^(أزرق|ازرق|blue)/i, '#2f6fd6'],
  [/^(لبني|لبنى|سماوي|sky)/i, '#9cc9ef'],
  [/^(أحمر|احمر|red)/i, '#c8332b'],
  [/^(نبيتي|نبيتى|عنابي|burgundy|maroon)/i, '#6e1d2b'],
  [/^(وردي|وردى|بمبي|بمبى|روز|pink)/i, '#f2a7bd'],
  [/^(سيمون|salmon)/i, '#f4a38c'],
  [/^(أخضر|اخضر|green)/i, '#2f8a4f'],
  [/^(زيتي|زيتى|olive)/i, '#6b6b2f'],
  [/^(أصفر|اصفر|yellow)/i, '#f2c230'],
  [/^(برتقالي|برتقالى|orange)/i, '#f16b21'],
  [/^(بني|بنى|brown)/i, '#7a4b2a'],
  [/^(كافيه|قهوة|coffee|camel|جملي)/i, '#a57a52'],
  [/^(بيج|beige|نود|nude)/i, '#e3d3bb'],
  [/^(رمادي|رمادى|رصاصي|رصاصى|gr[ae]y)/i, '#9a9a9f'],
  [/^(فضي|فضى|silver)/i, '#c9cbd0'],
  [/^(ذهبي|ذهبى|gold)/i, '#d4ad4a'],
  [/^(بنفسجي|بنفسجى|موف|purple|lilac|mauve)/i, '#8a63b8'],
];

export function swatch(name: string): string | null {
  const n = name.trim();
  for (const [re, hex] of SWATCHES) if (re.test(n)) return hex;
  return null;
}
