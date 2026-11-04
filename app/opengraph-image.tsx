import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const alt = 'فاترينة: كل فاترينات مصر في جيبك';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const HEADLINE = ['كل فاترينات مصر', 'في جيبك'];

const BRAND = '#f16b21';
const CREAM = '#fefcf7';
const INK = '#2a1d14';

/**
 * The OG renderer lays text out left to right and measures Arabic before joining letters, which
 * leaves ragged gaps. So the headline is shaped here into Arabic presentation forms (initial /
 * medial / final / isolated) and each line is reversed into visual order. Covers the letters used
 * on this card; add a row to FORMS before adding a word with a new letter.
 */
const FORMS: Record<string, number[]> = {
  // [isolated, final, initial, medial]; letters that never join forward have two forms.
  ا: [0xfe8d, 0xfe8e],
  ب: [0xfe8f, 0xfe90, 0xfe91, 0xfe92],
  ت: [0xfe95, 0xfe96, 0xfe97, 0xfe98],
  ج: [0xfe9d, 0xfe9e, 0xfe9f, 0xfea0],
  ر: [0xfead, 0xfeae],
  ص: [0xfeb9, 0xfeba, 0xfebb, 0xfebc],
  ف: [0xfed1, 0xfed2, 0xfed3, 0xfed4],
  ك: [0xfed9, 0xfeda, 0xfedb, 0xfedc],
  ل: [0xfedd, 0xfede, 0xfedf, 0xfee0],
  م: [0xfee1, 0xfee2, 0xfee3, 0xfee4],
  ن: [0xfee5, 0xfee6, 0xfee7, 0xfee8],
  ي: [0xfef1, 0xfef2, 0xfef3, 0xfef4],
};

function shapeWord(word: string) {
  const cs = [...word];
  return cs
    .map((c, i) => {
      const f = FORMS[c];
      if (!f) return c;
      const joinsPrev = i > 0 && FORMS[cs[i - 1]]?.length === 4;
      const joinsNext = f.length === 4 && i < cs.length - 1 && Boolean(FORMS[cs[i + 1]]);
      const form = joinsPrev ? (joinsNext ? 3 : 1) : joinsNext ? 2 : 0;
      return String.fromCharCode(f[form]);
    })
    .join('');
}

/** "كل فاترينات مصر" → shaped glyphs in left-to-right drawing order. */
const visualLine = (line: string) => [...line.split(' ').map(shapeWord).join(' ')].reverse().join('');

const LINES = HEADLINE.map(visualLine);

/**
 * Cairo Bold, subset to just these glyphs, from the Google Fonts CSS API. Any failure (offline
 * build, API change) returns null and the card is drawn without the headline.
 */
async function loadCairo(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Cairo:wght@700&text=${encodeURIComponent(LINES.join(''))}`)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function loadMark(): Promise<string | null> {
  try {
    const png = await readFile(join(process.cwd(), 'public/brand/fatrina-mark.png'));
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [cairo, mark] = await Promise.all([loadCairo(), loadMark()]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: CREAM }}>
        {/* Shop awning across the top, like the logo. */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 34, background: BRAND }} />
          <div style={{ display: 'flex' }}>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} style={{ width: 60, height: 30, background: BRAND, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: cairo ? 'space-between' : 'center', padding: '0 100px 40px', gap: 64 }}>
          {mark ? (
            <div style={{ display: 'flex', width: 280, height: 280, flexShrink: 0, borderRadius: 44, background: '#ffffff', border: `4px solid ${BRAND}`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img src={mark} width={320} height={320} />
            </div>
          ) : null}

          {cairo ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'Cairo', fontSize: 84, color: INK, lineHeight: 1.35 }}>
              {LINES.map((l) => (
                <div key={l} style={{ display: 'flex' }}>
                  {l}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: cairo ? [{ name: 'Cairo', data: cairo, weight: 700, style: 'normal' }] : undefined,
    },
  );
}
