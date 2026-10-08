import { Loader2 } from "lucide-react";

export default function EventDetailsLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <Loader2 className="h-9 w-9 animate-spin text-(--btn-primary-bg)" />
      <p className="text-sm font-medium text-(--text-secondary)">
        Loading event details...
      </p>
    </div>
  );
}