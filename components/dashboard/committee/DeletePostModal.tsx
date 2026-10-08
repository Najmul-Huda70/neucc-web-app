"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

type UnassignedPost = {
  postId: string;
  postTitle: string;
};

type DeletePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  committeeId?: string; // string | undefined
  committeeTitle: string;
  onSuccess: () => void;
};

export default function DeletePostModal({
  isOpen,
  onClose,
  committeeId,
  committeeTitle,
  onSuccess,
}: DeletePostModalProps) {
  const [posts, setPosts] = useState<UnassignedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<UnassignedPost | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && committeeId) {
      fetchUnassignedPosts();
    } else {
      resetState();
    }
  }, [isOpen, committeeId]);

  const resetState = () => {
    setPosts([]);
    setSelectedPost(null);
    setConfirmInput("");
    setError("");
  };

  const fetchUnassignedPosts = async () => {
    try {
      setFetching(true);
      setError("");
      const res = await fetch(`/api/committees/post?committeeId=${committeeId}`);
      const json = await res.json();

      if (json.success) {
        setPosts(json.data || []);
      } else {
        setError(json.error || "Failed to load posts");
      }
    } catch (err) {
      setError("Failed to fetch unassigned posts");
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || confirmInput.trim() !== selectedPost.postTitle.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/committees/post?postId=${selectedPost.postId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (json.success) {
        onSuccess();
        onClose();
      } else {
        setError(json.error || "Failed to delete post");
      }
    } catch (err) {
      setError("An error occurred while deleting the post");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-6 shadow-xl text-(--text-primary)">
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3 mb-4">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <AlertTriangle size={18} /> Delete Post ({committeeTitle})
          </h3>
          <button onClick={onClose} className="p-1 hover:opacity-75 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="py-8 text-center text-xs text-(--text-secondary)">
            Loading unassigned posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-6 text-center text-xs text-(--text-secondary)">
            No unassigned posts available to delete in this committee.
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
                Select Unassigned Post
              </label>
              <select
                className="w-full rounded-xl border border-(--border-color) bg-(--bg-app) px-3 py-2 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-red-500"
                value={selectedPost?.postId || ""}
                onChange={(e) => {
                  const p = posts.find((item) => item.postId === e.target.value);
                  setSelectedPost(p || null);
                  setConfirmInput("");
                }}
                required
              >
                <option value="">-- Select Post --</option>
                {posts.map((p) => (
                  <option key={p.postId} value={p.postId}>
                    {p.postTitle}
                  </option>
                ))}
              </select>
            </div>

            {selectedPost && (
              <div className="space-y-2 pt-2 border-t border-(--border-color)">
                <p className="text-xs text-(--text-secondary)">
                  To confirm deletion, please type{" "}
                  <span className="font-bold text-red-500 select-all">
                    "{selectedPost.postTitle}"
                  </span>{" "}
                  below:
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={`Type "${selectedPost.postTitle}"`}
                  className="w-full rounded-xl border border-red-500/40 bg-(--bg-app) px-3 py-2 text-sm text-(--text-primary) focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            )}

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
                disabled={
                  loading ||
                  !selectedPost ||
                  confirmInput.trim() !== selectedPost.postTitle.trim()
                }
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}