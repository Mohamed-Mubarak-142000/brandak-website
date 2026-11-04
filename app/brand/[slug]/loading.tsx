import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="pb-16 pt-4 sm:pt-6">
      <span className="sr-only" role="status">
        بنحمّل المتجر...
      </span>
      <div className="aspect-2/1 animate-pulse rounded-window bg-skeleton sm:aspect-3/1 lg:aspect-4/1" />
      <div className="flex items-end gap-4 px-1 sm:px-6 lg:px-8">
        <div className="-mt-12 size-24 shrink-0 rounded-full border-4 border-surface bg-skeleton sm:-mt-16 sm:size-32" />
        <div className="mb-2 h-8 w-48 animate-pulse rounded-card bg-skeleton" />
      </div>
      <div className="mt-6 h-4 max-w-2xl animate-pulse rounded-card bg-skeleton" />
      <div className="mt-2 h-4 max-w-xl animate-pulse rounded-card bg-skeleton" />
      <div className="mt-8 h-12 border-b border-line" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <div className="aspect-square animate-pulse rounded-card bg-skeleton" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded-card bg-skeleton" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded-card bg-skeleton" />
            </li>
          ))}
        </ul>
        <div className="hidden h-96 animate-pulse rounded-panel bg-skeleton lg:block" />
      </div>
    </Container>
  );
}
