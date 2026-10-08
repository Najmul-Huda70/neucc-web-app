// components/dashboard/events/ConfirmDeleteModal.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  /** Set false when a parent overlay already locks page scroll (e.g. the gallery viewer). */
  lockScroll?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
  error,
  lockScroll = true,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (lockScroll) document.body.style.overflow = previousOverflow;
    };
  }, [open, loading, lockScroll, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-(--card-bg) p-6 text-(--text-primary) shadow-2xl sm:p-7"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <Trash2 size={20} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-delete-title" className="text-lg font-bold">
              {title}
            </h2>
            <div id="confirm-delete-desc" className="mt-1.5 break-words text-sm leading-6 text-(--text-secondary)">
              {description}
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--card-hover) hover:text-(--text-primary) disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            <span>{loading ? "Deleting…" : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}