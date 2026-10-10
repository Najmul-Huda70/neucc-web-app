"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventTitle: string;
};

export default function DeleteEventSponsorModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
}: Props) {
  const [typedTitle, setTypedTitle] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeleteConfirm = async () => {
    if (typedTitle !== eventTitle) return;
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTypedTitle("");
    }
  };

  const isMatched = typedTitle === eventTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--bg-app) p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-(--border-color)">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={20} />
            <h2 className="text-base font-bold text-(--text-primary)">Confirm Removal</h2>
          </div>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary)">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-(--text-secondary)">
            Are you sure you want to remove this sponsor from <strong className="text-(--text-primary)">{eventTitle}</strong>? 
            This action cannot be undone.
          </p>

          <div>
            <label className="block text-xs font-medium text-(--text-secondary) mb-1">
              Type <span className="font-bold text-(--text-primary)">{eventTitle}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedTitle}
              onChange={(e) => setTypedTitle(e.target.value)}
              placeholder="Enter event title exactly"
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-(--border-color)">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--stat-card-bg)"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatched || loading}
            onClick={handleDeleteConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-40 transition"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>Remove Sponsor</span>
          </button>
        </div>
      </div>
    </div>
  );
}