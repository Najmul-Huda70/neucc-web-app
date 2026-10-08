"use client";

export default function ProfileSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-pulse">
      {/* Top Profile Summary Header Skeleton */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-slate-200 shrink-0" />

          {/* User Info */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="h-5 w-40 bg-slate-200 rounded mx-auto sm:mx-0" />
            <div className="h-3.5 w-56 bg-slate-200 rounded mx-auto sm:mx-0" />
          </div>
        </div>

        {/* Role Badge */}
        <div className="h-7 w-20 bg-slate-200 rounded-lg shrink-0" />
      </div>

      {/* Navigation Tabs Skeleton */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="flex items-center gap-6 sm:gap-8 px-4 sm:px-6 py-3.5">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Tab Content Body Skeleton */}
      <div className="w-full p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          {/* Left Title & Description */}
          <div className="space-y-2 w-full lg:w-1/3">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>

          {/* Right Upload Area Box */}
          <div className="w-full lg:w-2/3 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 bg-slate-50/30">
            <div className="w-20 h-20 bg-slate-200 rounded-full" />
            <div className="space-y-2 text-center">
              <div className="h-4 w-36 bg-slate-200 rounded mx-auto" />
              <div className="h-3 w-28 bg-slate-200 rounded mx-auto" />
            </div>
            <div className="h-9 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* Bottom Save Changes Button Skeleton */}
        <div className="flex justify-end pt-4">
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}