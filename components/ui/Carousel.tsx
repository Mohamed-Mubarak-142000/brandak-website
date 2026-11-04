'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * Self-playing, endless slider (Embla). Swipe on touch, arrows on desktop, dots everywhere.
 * Autoplay pauses while the pointer is over it or something inside has focus, and only starts
 * when the visitor hasn't asked for reduced motion.
 */
export function Carousel({
  children,
  label,
  delay = 5000,
  className,
  slideClassName,
}: {
  children: React.ReactNode;
  label: string;
  delay?: number;
  className?: string;
  slideClassName?: string;
}) {
  const slides = Children.toArray(children);
  const [plugins] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? []
      : [Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true, stopOnFocusIn: true })],
  );
  const [ref, api] = useEmblaCarousel({ loop: slides.length > 1, direction: 'rtl', align: 'start' }, plugins);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (api) setSelected(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on('select', onSelect).on('reInit', onSelect);
    return () => {
      api.off('select', onSelect).off('reInit', onSelect);
    };
  }, [api, onSelect]);

  const multiple = slides.length > 1;

  return (
    <section aria-roledescription="carousel" aria-label={label} className={cn('relative', className)}>
      <div ref={ref} className="overflow-hidden rounded-window">
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} من ${slides.length}`}
              className={cn('min-w-0 shrink-0 grow-0 basis-full', slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {multiple ? (
        <>
          {/* RTL: "previous" sits on the right and points right. */}
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="السابق"
            className="absolute start-3 top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-surface/90 text-ink shadow-card transition-colors hover:bg-surface hover:text-accent md:grid"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="التالي"
            className="absolute end-3 top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-surface/90 text-ink shadow-card transition-colors hover:bg-surface hover:text-accent md:grid"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <div className="mt-4 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`اعرض ${i + 1}`}
                aria-current={i === selected}
                className="grid h-6 cursor-pointer place-items-center px-0.5"
              >
                <span className={cn('block h-2 rounded-full transition-all duration-300', i === selected ? 'w-6 bg-brand' : 'w-2 bg-line-strong')} />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
