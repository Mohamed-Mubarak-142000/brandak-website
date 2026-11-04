export default function Loading() {
  return (
    <div aria-busy aria-label="بنحمّل" className="flex flex-col gap-4">
      <div className="h-9 w-48 animate-pulse rounded-card bg-skeleton" />
      <div className="h-11 w-full max-w-md animate-pulse rounded-full bg-skeleton" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-panel bg-skeleton" />
      ))}
    </div>
  );
}
