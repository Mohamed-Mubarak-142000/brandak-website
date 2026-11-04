import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="pt-4 sm:pt-8">
      <span className="sr-only" role="status">بنحمّل المتجر...</span>
      <div className="aspect-[5/2] animate-pulse rounded-window bg-skeleton sm:aspect-[4/1]" />
      <div className="flex items-end gap-4 px-1 sm:px-6">
        <div className="-mt-12 size-24 shrink-0 rounded-full border-4 border-ground bg-skeleton sm:-mt-16 sm:size-32" />
        <div className="mb-2 h-8 w-48 animate-pulse rounded-card bg-skeleton" />
      </div>
      <div className="mt-6 h-4 max-w-2xl animate-pulse rounded-card bg-skeleton" />
      <div className="mt-2 h-4 max-w-xl animate-pulse rounded-card bg-skeleton" />
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i}>
            <div className="aspect-square animate-pulse rounded-card bg-skeleton" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded-card bg-skeleton" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded-card bg-skeleton" />
          </li>
        ))}
      </ul>
    </Container>
  );
}
