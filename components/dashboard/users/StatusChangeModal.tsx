"use client";

import { useEffect, useState } from "react";

export type StatusType = "ACTIVE" | "DEACTIVATED" | "CLOSED";

interface StatusChangeModalProps {
  isOpen: boolean;
  currentStatus: StatusType;
  userName?: string;
  onClose: () => void;
  onConfirm: (newStatus: StatusType) => Promise<void>;
}

export default function StatusChangeModal({
  isOpen,
  currentStatus,
  userName,
  onClose,
  onConfirm,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      setError(null);
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onConfirm(selectedStatus);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const isDanger = selectedStatus === "DEACTIVATED" || selectedStatus === "CLOSED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-(--card-bg) p-6 shadow-2xl border border-(--btn-secondary-border)">
        <div className="flex items-center justify-between border-b border-(--btn-secondary-border) pb-3">
          <h2 className="text-base font-bold text-(--text-primary)">
            Update Status
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-(--text-secondary) hover:bg-(--stat-card-bg) hover:text-(--text-primary) transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-(--text-important)/30 bg-(--text-important)/10 p-2.5 text-xs text-(--text-important) font-medium">
              {error}
            </div>
          )}

          {userName && (
            <p className="text-xs text-(--text-secondary)">
              Changing status for <strong className="text-(--text-primary)">{userName}</strong>
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1.5">
              Select Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusType)}
              className="w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) p-2.5 text-xs font-medium text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-hidden cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-(--btn-secondary-border)">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) px-4 py-2 text-xs font-semibold text-(--text-primary) hover:bg-(--stat-card-bg) transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-xl px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer ${
                isDanger
                  ? "bg-(--text-important) text-white hover:opacity-90"
                  : "bg-(--btn-primary-bg) text-(--btn-primary-text) hover:opacity-90"
              }`}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}