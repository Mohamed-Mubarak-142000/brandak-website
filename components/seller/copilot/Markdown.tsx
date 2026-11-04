import Link from 'next/link';
import { Fragment } from 'react';

/**
 * The little markdown the copilot writes: paragraphs, "-"/"1." lists, **bold**, [links](...) and
 * bare /seller/... paths (as site links). Everything else stays plain text — no HTML is injected.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ({ type: 'p'; lines: string[] } | { type: 'ul' | 'ol'; items: string[] })[] = [];
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*(?:\d+|[٠-٩]+)[.)]\s+(.*)$/.exec(line);
    const last = blocks[blocks.length - 1];
    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      const item = (bullet ?? numbered)![1];
      if (last && last.type === type) last.items.push(item);
      else blocks.push({ type, items: [item] });
    } else if (!line.trim()) {
      blocks.push({ type: 'p', lines: [] });
    } else {
      const clean = line.replace(/^#{1,6}\s+(.*)$/, '**$1**');
      if (last && last.type === 'p') last.lines.push(clean);
      else blocks.push({ type: 'p', lines: [clean] });
    }
  }

  return (
    <div className="flex flex-col gap-2 wrap-break-word">
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          b.lines.length ? (
            <p key={i}>
              {b.lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 ? <br /> : null}
                  <Inline text={l} />
                </Fragment>
              ))}
            </p>
          ) : null
        ) : b.type === 'ul' ? (
          <ul key={i} className="flex list-disc flex-col gap-1 ps-5">
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} />
              </li>
            ))}
          </ul>
        ) : (
          <ol key={i} className="flex list-decimal flex-col gap-1 ps-5">
            {b.items.map((it, j) => (
              <li key={j}>
                <Inline text={it} />
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)]+|\/seller(?:\/[\w\-/?=&%.]*)?)/g;
const linkClass = 'font-bold text-accent underline underline-offset-4 hover:text-accent-hover';

function Anchor({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith('/seller'))
    return (
      <Link href={href.replace(/[.،,]+$/, '')} className={linkClass}>
        {children}
      </Link>
    );
  if (/^https?:\/\//.test(href))
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    );
  return <>{children}</>;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (i % 2 === 0) return <Fragment key={i}>{part.replace(/`/g, '')}</Fragment>;
        if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        const md = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (md) return <Anchor key={i} href={md[2]}>{md[1]}</Anchor>;
        const trimmed = part.replace(/[.،,]+$/, '');
        return (
          <Fragment key={i}>
            <Anchor href={trimmed}>
              <bdi dir="ltr">{trimmed}</bdi>
            </Anchor>
            {part.slice(trimmed.length)}
          </Fragment>
        );
      })}
    </>
  );
}
