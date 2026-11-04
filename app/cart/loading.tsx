import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="py-6 sm:py-10">
      <div role="status" aria-label="بنحمّل السلة" className="max-w-3xl animate-pulse space-y-5">
        <div className="h-8 w-24 rounded-card bg-skeleton" />
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4 rounded-panel border border-line p-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-skeleton" />
              <div className="h-4 w-32 rounded-full bg-skeleton" />
            </div>
            <div className="flex gap-4">
              <div className="size-20 rounded-card bg-skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-full bg-skeleton" />
                <div className="h-4 w-1/3 rounded-full bg-skeleton" />
              </div>
            </div>
            <div className="h-12 w-full rounded-full bg-skeleton" />
          </div>
        ))}
      </div>
    </Container>
  );
}
