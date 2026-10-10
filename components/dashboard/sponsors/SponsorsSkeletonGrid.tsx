// components/dashboard/sponsors/SponsorsSkeletonGrid.tsx
import { Building2 } from "lucide-react";

export default function SponsorsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="group flex flex-col rounded-2xl border border-(--border-color) bg-(--card-bg) overflow-hidden shadow-xs animate-pulse"
        >
          {/* Top Half: Logo Container Skeleton */}
          <div className="relative h-36 w-full bg-(--stat-card-bg)/50 flex items-center justify-center p-4 border-b border-(--border-color)">
            <div className="flex flex-col items-center gap-1 text-(--text-muted)/40">
              <Building2 size={32} />
              <div className="h-3 w-16 bg-(--stat-card-bg) rounded-md" />
            </div>

            {/* Event Count Badge Skeleton */}
            <div className="absolute top-3 right-3 rounded-full bg-(--stat-card-bg) w-20 h-5" />
          </div>

          {/* Bottom Half: Company Info Skeleton */}
          <div className="p-4 flex flex-col justify-between flex-1 space-y-4">
            <div className="space-y-2">
              {/* Title line */}
              <div className="h-5 w-3/4 bg-(--stat-card-bg) rounded-lg" />
              {/* Website line */}
              <div className="h-3.5 w-1/2 bg-(--stat-card-bg) rounded-md" />
            </div>

            {/* Footer action link line */}
            <div className="pt-3 border-t border-(--border-color) flex items-center justify-between">
              <div className="h-3 w-28 bg-(--stat-card-bg) rounded-md" />
              <div className="h-3 w-4 bg-(--stat-card-bg) rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}