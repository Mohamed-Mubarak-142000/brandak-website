import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="pt-4 sm:pt-6">
      <div role="status" aria-label="بنحمّل المنتج" className="animate-pulse">
        <div className="h-4 w-56 rounded-full bg-skeleton" />
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          <div className="flex flex-col-reverse gap-3 xl:flex-row">
            <div className="flex gap-2 xl:w-20 xl:flex-col">
              {[0, 1, 2].map((i) => (
                <div key={i} className="size-16 rounded-card bg-skeleton sm:size-20" />
              ))}
            </div>
            <div className="aspect-square flex-1 rounded-panel bg-skeleton" />
          </div>
          <div className="space-y-5 lg:rounded-panel lg:border lg:border-line lg:p-6">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-full bg-skeleton" />
              <div className="h-4 w-32 rounded-full bg-skeleton" />
            </div>
            <div className="h-7 w-full rounded-card bg-skeleton" />
            <div className="h-7 w-2/3 rounded-card bg-skeleton" />
            <div className="h-10 w-40 rounded-card bg-skeleton" />
            <div className="h-20 w-full rounded-card bg-skeleton" />
            <div className="h-14 w-full rounded-full bg-skeleton" />
            <div className="h-36 w-full rounded-card bg-skeleton" />
          </div>
        </div>
      </div>
    </Container>
  );
}
