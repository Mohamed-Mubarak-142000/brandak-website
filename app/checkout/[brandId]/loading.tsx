import { Container } from '@/components/Container';

export default function Loading() {
  return (
    <Container className="py-6 sm:py-10">
      <div role="status" aria-label="بنحمّل صفحة الطلب" className="animate-pulse">
        <div className="h-8 w-64 rounded-card bg-skeleton" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            {[0, 1].map((i) => (
              <div key={i} className="h-44 rounded-panel bg-skeleton" />
            ))}
          </div>
          <div className="h-80 rounded-panel bg-skeleton" />
        </div>
      </div>
    </Container>
  );
}
