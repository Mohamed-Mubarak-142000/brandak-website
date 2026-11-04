import { cn } from '@/lib/cn';

/**
 * An endless, self-moving row (store logos, categories). The items render twice in one track that
 * slides by half its width, so the loop is seamless. Pauses on hover and keyboard focus; with
 * reduced motion it stops and becomes a normal scrollable row (see globals.css). The copy is
 * hidden from screen readers and taken out of the tab order.
 *
 * `secondsPerItem` keeps the speed steady whatever the number of items.
 */
export function Marquee<T>({
  items,
  render,
  getKey,
  secondsPerItem = 3.5,
  label,
  className,
  itemClassName,
}: {
  items: T[];
  render: (item: T, copy: boolean) => React.ReactNode;
  getKey: (item: T) => string;
  secondsPerItem?: number;
  label: string;
  className?: string;
  itemClassName?: string;
}) {
  if (!items.length) return null;
  // Short lists repeat until each half is wide enough to fill a desktop screen.
  const repeat = Math.max(1, Math.ceil(10 / items.length));
  const half = Array.from({ length: repeat }, () => items).flat();
  const duration = `${Math.max(20, half.length * secondsPerItem)}s`;

  return (
    <div
      role="region"
      aria-label={label}
      className={cn('marquee rail relative overflow-hidden [mask-image:linear-gradient(to_left,transparent,#000_6%,#000_94%,transparent)]', className)}
    >
      <ul className="marquee-track flex w-max" style={{ ['--marquee-duration' as string]: duration }}>
        {half.map((item, i) => (
          <li key={`a-${getKey(item)}-${i}`} className={cn('shrink-0', itemClassName)}>
            {render(item, i >= items.length)}
          </li>
        ))}
        {half.map((item, i) => (
          <li key={`b-${getKey(item)}-${i}`} aria-hidden className={cn('marquee-clone shrink-0', itemClassName)} inert>
            {render(item, true)}
          </li>
        ))}
      </ul>
    </div>
  );
}
