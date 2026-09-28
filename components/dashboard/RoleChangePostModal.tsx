"use client";

import { useEffect, useState } from "react";
import { CommitteeOption } from "@/lib/types/user";

interface RoleChangePostModalProps {
  isOpen: boolean;
  userName: string;
  targetRole: "ADMIN" | "MODARATOR";
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    committeeId: string;
    postMode: "new" | "existing";
    existingPostId?: string;
    newPostTitle?: string;
  }) => void;
}

export default function RoleChangePostModal({
  isOpen,
  userName,
  targetRole,
  loading,
  onClose,
  onConfirm,
}: RoleChangePostModalProps) {
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [committeeId, setCommitteeId] = useState("");
  const [postMode, setPostMode] = useState<"new" | "existing">("new");
  const [existingPostId, setExistingPostId] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCommitteeId("");
    setExistingPostId("");
    setNewPostTitle("");
    setPostMode("new");
    setError(null);
    fetch("/api/committees")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setCommittees(json.data);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedCommittee = committees.find((c) => c.id === committeeId);

  const handleConfirm = () => {
    if (!committeeId) return setError("Select a committee.");
    if (postMode === "new" && !newPostTitle) return setError("Enter a post title.");
    if (postMode === "existing" && !existingPostId) return setError("Select a post.");

    onConfirm({
      committeeId,
      postMode,
      existingPostId: postMode === "existing" ? existingPostId : undefined,
      newPostTitle: postMode === "new" ? newPostTitle : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-[var(--card-bg)] p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Assign a Committee Post
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{userName}</span> must hold a
          post to become <span className="font-semibold">{targetRole === "ADMIN" ? "Admin" : "Moderator"}</span>.
        </p>

        <div className="mt-4 space-y-3">
          {error && (
            <div className="rounded-xl border border-[var(--text-important)]/30 bg-[var(--text-important)]/10 p-2.5 text-xs text-[var(--text-important)]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)]">Committee</label>
            <select
              value={committeeId}
              onChange={(e) => {
                setCommitteeId(e.target.value);
                setExistingPostId("");
              }}
              className="mt-1 w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden"
            >
              <option value="">Select a committee</option>
              {committees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type} - {c.session}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 text-xs font-medium text-[var(--text-primary)]">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={postMode === "new"}
                onChange={() => setPostMode("new")}
                className="accent-[var(--btn-primary-bg)]"
              />
              Create new post
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={postMode === "existing"}
                onChange={() => setPostMode("existing")}
                className="accent-[var(--btn-primary-bg)]"
              />
              Assign existing post
            </label>
          </div>

          {postMode === "new" ? (
            <input
              type="text"
              placeholder="e.g. Vice President"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden"
            />
          ) : (
            <select
              value={existingPostId}
              onChange={(e) => setExistingPostId(e.target.value)}
              className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden"
            >
              <option value="">Select a post to reassign</option>
              {selectedCommittee?.posts.map((p) => (
                <option key={p.postId} value={p.postId}>
                  {p.postTitle} (currently: {p.users?.name || "—"})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[var(--btn-secondary-border)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--stat-card-bg)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-[var(--btn-primary-bg)] px-5 py-2 text-xs font-semibold text-[var(--btn-primary-text)] shadow-xs hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Confirm & Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}