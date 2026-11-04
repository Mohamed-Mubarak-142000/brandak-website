import Image from 'next/image';

import { cn } from '@/lib/cn';

/** An app screenshot (1080x1920) inside a plain phone bezel. */
export function PhoneFrame({
  src,
  alt,
  className,
  priority,
  sizes = '(min-width: 640px) 192px, 40vw',
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn('rounded-[2rem] bg-ink p-1.5 shadow-pop ring-1 ring-line-strong', className)}>
      <Image
        src={src}
        alt={alt}
        width={1080}
        height={1920}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className="h-auto w-full rounded-[1.6rem]"
      />
    </div>
  );
}
