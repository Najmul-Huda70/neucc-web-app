// import { Loader2 } from "lucide-react";

// export default function GlobalLoading() {
//   return (
//     <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-(--bg-app) px-4 py-12">
//       <div className="relative flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-bg) p-8 text-center shadow-lg backdrop-blur-md">
//         {/* Glow Ambient Accent */}
//         <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-(--btn-primary-bg)/10 blur-2xl" />
//         <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-(--btn-primary-bg)/10 blur-2xl" />

//         {/* Brand Details */}
//         <h2 className="text-base font-bold tracking-tight text-(--text-primary)">
//           Computer Club
//         </h2>
//         <p className="mt-1 text-[11px] font-medium text-(--text-muted)">
//           Dept. of CSE, Netrokona University, Bangladesh
//         </p>

//         {/* Loading Spinner & Status */}
//         <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-(--border-color) bg-(--bg-app) px-4 py-1.5 shadow-inner">
//           <Loader2 className="h-4 w-4 animate-spin text-(--btn-primary-bg)" />
//           <span className="text-xs font-semibold text-(--text-secondary)">
//             Loading...
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center bg-(--bg-app) px-4 py-12">
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-bg) p-8 text-center shadow-md backdrop-blur-md sm:p-10">
        {/* Glow Accent Effect */}
        <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-(--btn-primary-bg)/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-(--btn-primary-bg)/10 blur-xl" />

        {/* Animated Spinner Icon */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-app) text-(--btn-primary-bg) shadow-inner">
          <Loader2 className="h-7 w-7 animate-spin stroke-[2.5]" />
        </div>

        {/* Text Details */}
        <h3 className="text-sm font-bold tracking-tight text-(--text-primary)">
          Loading...
        </h3>
        <p className="mt-1 text-xs text-(--text-muted)">
          Please wait while we fetch the contents.
        </p>
      </div>
    </div>
  );
}