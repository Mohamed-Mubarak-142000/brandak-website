import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="pt-5 sm:pt-8">
      <div role="status" aria-label="بنحمّل المنتج" className="animate-pulse">
        <div className="h-4 w-48 rounded-full bg-skeleton" />
        <div className="mt-4 grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="aspect-square rounded-panel bg-skeleton" />
          <div className="space-y-4">
            <div className="h-9 w-40 rounded-full bg-skeleton" />
            <div className="h-8 w-full rounded-card bg-skeleton" />
            <div className="h-8 w-2/3 rounded-card bg-skeleton" />
            <div className="h-10 w-32 rounded-card bg-skeleton" />
            <div className="h-24 w-full rounded-panel bg-skeleton" />
            <div className="h-14 w-full rounded-full bg-skeleton" />
          </div>
        </div>
      </div>
    </Container>
  );
}
