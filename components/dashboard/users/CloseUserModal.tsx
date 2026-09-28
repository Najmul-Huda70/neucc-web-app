"use client";

interface CloseUserModalProps {
  isOpen: boolean;
  userName?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CloseUserModal({
  isOpen,
  userName,
  loading = false,
  onCancel,
  onConfirm,
}: CloseUserModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--btn-secondary-border)]">
        <div className="flex items-center justify-between border-b border-[var(--btn-secondary-border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Close Account
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--stat-card-bg)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            This will close{" "}
            <strong className="font-semibold text-[var(--text-primary)]">
              {userName || "this user"}
            </strong>
            's account. They will no longer be able to log in or perform any actions, but all existing data will be preserved.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--btn-secondary-border)]">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--stat-card-bg)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--text-important)] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Closing..." : "Close Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}