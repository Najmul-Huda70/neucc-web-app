"use client";

interface DemoteConfirmModalProps {
  isOpen: boolean;
  userName: string;
  postTitles: string[];
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DemoteConfirmModal({
  isOpen,
  userName,
  postTitles,
  loading,
  onCancel,
  onConfirm,
}: DemoteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Remove Committee Post?</h2>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{userName}</span> currently
          holds{" "}
          <span className="font-semibold text-[var(--text-important)]">
            {postTitles.join(", ")}
          </span>
          . Changing their role to Member will remove them from{" "}
          {postTitles.length > 1 ? "these posts" : "this post"}.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[var(--btn-secondary-border)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--stat-card-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-[var(--text-important)] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Confirm Demotion"}
          </button>
        </div>
      </div>
    </div>
  );
}