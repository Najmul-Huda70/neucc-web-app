"use client";

import { AlertTriangle, RotateCw, ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto my-12 w-full max-w-lg rounded-2xl border border-red-500/20 bg-(--card-bg) p-8 text-center shadow-lg">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <AlertTriangle size={28} />
      </div>

      <h2 className="text-lg font-bold text-(--text-primary)">
        Failed to load events
      </h2>
      <p className="mt-2 text-xs text-(--text-muted)">{message}</p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-md border border-(--border-color) bg-(--card-bg) px-4 py-2 text-xs font-semibold text-(--text-primary) transition hover:bg-(--card-hover)"
        >
          <ArrowLeft size={14} />
          Go Back
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md bg-(--btn-primary-bg) px-4 py-2 text-xs font-semibold text-(--btn-primary-text) transition hover:opacity-90"
        >
          <RotateCw size={14} />
          Reload
        </button>
      </div>
    </div>
  );
}