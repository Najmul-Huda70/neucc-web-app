"use client";

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

export default function EventDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-(--bg-app)">
      {/* 1. Light Gray Hero Header Skeleton */}
      <div className="relative isolate aspect-[2.2/1] min-h-[320px] w-full overflow-hidden bg-[#f3f0e9] border-b border-[#d9d5cc] sm:min-h-[420px]">
        {/* Subtle Light Gradient Layer */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f8f6f0] via-[#ece8df] to-[#e4ded3] animate-pulse" />

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12">
          {/* Top Section: Category/Type & Committee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d6cebf] animate-pulse" />
              <div className="h-3.5 w-24 rounded-md bg-[#d6cebf] animate-pulse" />
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3.5 w-20 rounded-md bg-[#d6cebf] animate-pulse" />
              <div className="h-3 w-10 rounded-md bg-[#e2dccf] animate-pulse" />
            </div>
          </div>

          {/* Bottom Section: Title & Details */}
          <div className="mt-auto pt-6">
            <div className="h-8 sm:h-12 lg:h-14 w-3/4 max-w-2xl rounded-lg bg-[#d0c7b7] animate-pulse mb-6" />

            <div className="flex flex-wrap items-center gap-8 border-t border-[#d9d5cc] pt-4">
              <div className="h-4 w-36 rounded-md bg-[#d6cebf] animate-pulse" />
              <div className="h-4 w-28 rounded-md bg-[#d6cebf] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Skeleton */}
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
          {/* Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="h-72 rounded-2xl border border-(--border-color) bg-(--card-bg) p-6 animate-pulse" />
          </div>

          {/* Description */}
          <div className="order-2 min-w-0 lg:order-1 space-y-4">
            <div className="h-6 w-40 rounded-md bg-(--border-color) animate-pulse" />
            <div className="h-4 w-full rounded-md bg-(--border-color) animate-pulse" />
            <div className="h-4 w-11/12 rounded-md bg-(--border-color) animate-pulse" />
            <div className="h-4 w-4/5 rounded-md bg-(--border-color) animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-(--border-color) animate-pulse" />
          </div>
        </div>
      </Container>
    </main>
  );
}