import { cn } from '@/lib/cn';

/**
 * The scalloped shop awning from the logo — the site's one decorative signature. Use it to top a
 * "shopfront" (hero window, store-type cards), never as a generic divider.
 */
export function Awning({ className, tone = 'brand' }: { className?: string; tone?: 'brand' | 'accent' | 'soft' }) {
  const fill = tone === 'brand' ? 'var(--brand)' : tone === 'accent' ? 'var(--accent)' : 'var(--accent-soft)';
  const id = `awning-${tone}`;
  return (
    <svg aria-hidden className={cn('block h-5 w-full', className)} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="36" height="20" patternUnits="userSpaceOnUse">
          <rect width="36" height="8" fill={fill} />
          <path d="M0 8 h36 a18 12 0 0 1 -36 0z" fill={fill} />
        </pattern>
      </defs>
      <rect width="100%" height="20" fill={`url(#${id})`} />
    </svg>
  );
}
