import clsx from 'clsx';
import Image from 'next/image';

/** An app screenshot (1080x1920) inside a plain phone bezel. */
export function PhoneFrame({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={clsx('rounded-4xl border border-line-strong bg-ink p-2 shadow-pop', className)}>
      <Image
        src={src}
        alt={alt}
        width={1080}
        height={1920}
        sizes="(min-width: 640px) 176px, 30vw"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        className="h-auto w-full rounded-3xl"
      />
    </div>
  );
}
