"use client";

import { useEffect, useState } from "react";
import { CommitteeOption } from "./CreateUserModal";

interface RoleChangePostModalProps {
  isOpen: boolean;
  userName: string;
  targetRole: "ADMIN" | "MODERATOR";
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
  const [selectedCommitteeKey, setSelectedCommitteeKey] = useState(""); // Composite key: "TYPE|YEAR"
  const [postMode, setPostMode] = useState<"new" | "existing">("new");
  const [existingPostTitle, setExistingPostTitle] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCommitteeKey("");
    setExistingPostTitle("");
    setNewPostTitle("");
    setPostMode("new");
    setError(null);

    fetch("/api/committees")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const active = json.data.filter(
            (c: CommitteeOption) => c.status === "ACTIVE"
          );
          setCommittees(active);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected Committee extraction using type & year
  const [selectedType, selectedYearStr] = selectedCommitteeKey.split("|");
  const selectedYear = selectedYearStr ? parseInt(selectedYearStr, 10) : null;

  const selectedCommittee = committees.find(
    (c) => c.type === selectedType && c.year === selectedYear
  );

  const handleConfirm = async () => {
    setError(null);

    if (!selectedCommitteeKey) return setError("Select a committee.");
    if (postMode === "new" && !newPostTitle.trim())
      return setError("Enter a post title.");
    if (postMode === "existing" && !existingPostTitle)
      return setError("Select a post.");

    let realCommitteeId = "";
    let realExistingPostId = "";

    if (selectedType && selectedYear) {
      try {
        const lookupRes = await fetch(
          `/api/committees/lookup?type=${selectedType}&year=${selectedYear}`
        );
        const lookupData = await lookupRes.json();

        if (!lookupRes.ok || !lookupData.committeeId) {
          return setError("Could not find database ID for selected committee.");
        }
        realCommitteeId = lookupData.committeeId;

        if (postMode === "existing" && existingPostTitle) {
          const matchedPost = lookupData.posts?.find(
            (p: { postId: string; postTitle: string }) =>
              p.postTitle === existingPostTitle
          );
          if (matchedPost) {
            realExistingPostId = matchedPost.postId;
          }
        }
      } catch (err) {
        return setError("Failed to verify committee details.");
      }
    }

    onConfirm({
      committeeId: realCommitteeId,
      postMode,
      existingPostId: postMode === "existing" ? realExistingPostId : undefined,
      newPostTitle: postMode === "new" ? newPostTitle.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-(--card-bg) p-6 shadow-2xl border border-(--btn-secondary-border)">
        <h2 className="text-lg font-bold text-(--text-primary)">
          Assign a Committee Post
        </h2>
        <p className="mt-1 text-xs text-(--text-secondary)">
          <span className="font-semibold text-(--text-primary)">{userName}</span> must hold a
          post to become <span className="font-semibold">{targetRole === "ADMIN" ? "Admin" : "Moderator"}</span>.
        </p>

        <div className="mt-4 space-y-3">
          {error && (
            <div className="rounded-xl border border-(--text-important)/30 bg-(--text-important)/10 p-2.5 text-xs text-(--text-important)">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">Committee</label>
            <select
              value={selectedCommitteeKey}
              onChange={(e) => {
                setSelectedCommitteeKey(e.target.value);
                setExistingPostTitle("");
              }}
              className="w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden cursor-pointer"
            >
              <option value="">Select a committee</option>
              {committees.map((c) => {
                const key = `${c.type}|${c.year}`;
                return (
                  <option key={key} value={key}>
                    {`The ${c.type} Committee-${c.year}`}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-4 text-xs font-medium text-(--text-primary) pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={postMode === "new"}
                onChange={() => setPostMode("new")}
                className="accent-(--btn-primary-bg)"
              />
              Create new post
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={postMode === "existing"}
                onChange={() => setPostMode("existing")}
                className="accent-(--btn-primary-bg)"
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
              className="w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
            />
          ) : (
            <select
              value={existingPostTitle}
              onChange={(e) => setExistingPostTitle(e.target.value)}
              className="w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden cursor-pointer"
            >
              <option value="">Select a post to reassign</option>
              {selectedCommittee?.posts?.map((p, idx) => {
                const currentUser =
                  p.user_posts?.[0]?.user?.name || "Unassigned";
                return (
                  <option key={idx} value={p.postTitle}>
                    {p.postTitle} (currently: {currentUser})
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-(--btn-secondary-border)">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-(--btn-secondary-border) px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--stat-card-bg) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-xl bg-(--btn-primary-bg) px-5 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {loading ? "Saving..." : "Confirm & Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}