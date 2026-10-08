"use client";

export default function UsersTableSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-(--border-color) bg-(--card-bg) p-4 shadow-xs animate-pulse space-y-4">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-(--border-color)">
        <div className="h-4 w-28 bg-(--border-color) rounded-md" />
        <div className="h-4 w-20 bg-(--border-color) rounded-md" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-(--border-color)" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-(--border-color) rounded" />
                <div className="h-3 w-48 bg-(--border-color) rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-(--border-color) rounded-full" />
            <div className="h-8 w-8 bg-(--border-color) rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}