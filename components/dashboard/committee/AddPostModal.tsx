"use client";

import { useState } from "react";
import { X } from "lucide-react";

type AddPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  committeeId?: string; // string | undefined
  committeeTitle: string;
  onSuccess: () => void;
};

export default function AddPostModal({
  isOpen,
  onClose,
  committeeId,
  committeeTitle,
  onSuccess,
}: AddPostModalProps) {
  const [postTitle, setPostTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/committees/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ committeeId, postTitle }),
      });

      const json = await res.json();

      if (json.success) {
        setPostTitle("");
        onSuccess();
        onClose();
      } else {
        setError(json.error || "Failed to add post");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-6 shadow-xl text-(--text-primary)">
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3 mb-4">
          <h3 className="text-lg font-bold">Add Post to {committeeTitle}</h3>
          <button onClick={onClose} className="p-1 hover:opacity-75 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
              Post Title / Role Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vice President, Executive Member"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-(--btn-primary-bg)"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-(--border-color) hover:bg-(--card-hover) cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}