export default function EventSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Category Group 1 Skeleton */}
      <div className="space-y-4">
        {/* Category Title Skeleton */}
        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>

        {/* 3 Grid Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col h-full"
            >
              {/* Banner / Image Area */}
              <div className="relative w-full h-44 bg-slate-200">
                {/* Badge Skeleton */}
                <div className="absolute top-3 right-3 h-6 w-20 bg-slate-300 rounded-full"></div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  {/* Category Subtitle */}
                  <div className="h-3 w-20 bg-slate-200 rounded-xs"></div>

                  {/* Title */}
                  <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>

                  {/* Description Lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full bg-slate-200 rounded-xs"></div>
                    <div className="h-3.5 w-4/5 bg-slate-200 rounded-xs"></div>
                  </div>

                  {/* Date & Location Metas */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-xs bg-slate-200"></div>
                      <div className="h-3.5 w-24 bg-slate-200 rounded-xs"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-xs bg-slate-200"></div>
                      <div className="h-3.5 w-48 bg-slate-200 rounded-xs"></div>
                    </div>
                  </div>
                </div>

                {/* Footer Separator & Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-3.5 w-36 bg-slate-200 rounded-xs"></div>
                  <div className="h-3.5 w-12 bg-slate-200 rounded-xs"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}