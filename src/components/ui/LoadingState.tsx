export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-surface/70 px-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" aria-hidden="true" />
      <span className="mt-4 text-sm font-medium text-text-muted">{label}</span>
    </div>
  );
}

export function CardGridLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading events">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="aspect-[16/8] animate-pulse bg-stat-surface" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-28 animate-pulse rounded bg-stat-surface" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-stat-surface" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-stat-surface" />
            <div className="h-16 animate-pulse rounded bg-stat-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GalleryGridLoading({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading gallery">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="aspect-square animate-pulse rounded-xl border border-border bg-stat-surface" />
      ))}
    </div>
  );
}
