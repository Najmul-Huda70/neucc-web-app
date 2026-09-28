"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "@/lib/types";
import { UserRow } from "./users/UsersTable";
import { CommitteeOption } from "./users/CreateUserModal";

interface RoleChangeModalProps {
  isOpen: boolean;
  user: UserRow | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    role: Role;
    committeeId?: string;
    postMode?: "new" | "existing";
    existingPostId?: string;
    newPostTitle?: string;
    confirmRemovePost?: boolean;
  }) => void;
}

const ROLES_REQUIRING_POST: Role[] = ["ADMIN", "MODERATOR"];

export default function RoleChangeModal({ isOpen, user, loading, onClose, onSubmit }: RoleChangeModalProps) {
  const [role, setRole] = useState<Role>("MEMBER");
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [committeeId, setCommitteeId] = useState("");
  const [postMode, setPostMode] = useState<"new" | "existing">("new");
  const [existingPostId, setExistingPostId] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (!isOpen || !user) return;
  
  setRole(user.role as Role); 

  setCommitteeId("");
  setExistingPostId("");
  setNewPostTitle("");
  setPostMode("new");
  setError(null);

  fetch("/api/committees")
    .then((res) => res.json())
    .then((json) => { if (json.success && json.data) setCommittees(json.data); })
    .catch(() => {});
}, [isOpen, user]);
  if (!user) return null;

  // Normalizing posts from both `posts` or `user_posts` properties
  const userPosts = user.posts && user.posts.length > 0
    ? user.posts.map(p => ({ postId: p.postId, title: p.postTitle }))
    : user.user_posts && user.user_posts.length > 0
    ? user.user_posts.map(p => ({ postId: p.postId, title: p.post?.postTitle || "Post" }))
    : [];

  const requiresPost = ROLES_REQUIRING_POST.includes(role);
  const hasExistingPost = userPosts.length > 0;
  const needsNewAssignment = requiresPost && !hasExistingPost;
  const willRemovePost = !requiresPost && hasExistingPost;
  const selectedCommittee = committees.find((c) => c.id === committeeId);

  const handleSubmit = () => {
    setError(null);
    if (role === user.role) return setError("Select a different role to continue.");

    if (needsNewAssignment) {
      if (!committeeId) return setError("Select a committee.");
      if (postMode === "new" && !newPostTitle) return setError("Enter a post title.");
      if (postMode === "existing" && !existingPostId) return setError("Select a post.");
    }

    onSubmit({
      role,
      ...(needsNewAssignment && {
        committeeId,
        postMode,
        existingPostId: postMode === "existing" ? existingPostId : undefined,
        newPostTitle: postMode === "new" ? newPostTitle : undefined,
      }),
      ...(willRemovePost && { confirmRemovePost: true }),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl bg-[var(--card-bg)] p-6 shadow-xl border border-[var(--btn-secondary-border)] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--btn-secondary-border)] pb-3">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Change Role</h2>
              <button 
                onClick={onClose} 
                className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--stat-card-bg)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-[var(--text-primary)]/70">
              Updating role for <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>
            </p>

            <div className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl border border-[var(--text-important)]/30 bg-[var(--text-important)]/10 p-2.5 text-xs font-medium text-[var(--text-important)]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden cursor-pointer"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <AnimatePresence mode="wait">
                {needsNewAssignment && (
                  <motion.div
                    key="post-assign"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 overflow-hidden rounded-xl border border-[var(--btn-primary-bg)]/30 bg-[var(--badge-bg)] p-3.5"
                  >
                    <p className="text-[11px] font-semibold text-[var(--btn-primary-bg)]">
                      Required — {role === "ADMIN" ? "Admin" : "Moderator"} accounts must hold a committee post
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Committee</label>
                      <select
                        value={committeeId}
                        onChange={(e) => { setCommitteeId(e.target.value); setExistingPostId(""); }}
                        className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden cursor-pointer"
                      >
                        <option value="">Select a committee</option>
                        {committees.map((c) => (
                          <option key={c.id} value={c.id}>{c.type} - {c.session}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-4 text-xs font-medium text-[var(--text-primary)] pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={postMode === "new"} onChange={() => setPostMode("new")} className="accent-[var(--btn-primary-bg)]" />
                        Create new post
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={postMode === "existing"} onChange={() => setPostMode("existing")} className="accent-[var(--btn-primary-bg)]" />
                        Assign existing post
                      </label>
                    </div>

                    {postMode === "new" ? (
                      <input
                        type="text"
                        placeholder="e.g. Vice President"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden"
                      />
                    ) : (
                      <select
                        value={existingPostId}
                        onChange={(e) => setExistingPostId(e.target.value)}
                        className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] text-[var(--text-primary)] p-2.5 text-xs focus:border-[var(--btn-primary-bg)] focus:outline-hidden cursor-pointer"
                      >
                        <option value="">Select a post to reassign</option>
                        {selectedCommittee?.posts.map((p) => (
                          <option key={p.postId} value={p.postId}>{p.postTitle} (currently: {p.users?.name || "—"})</option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}

                {willRemovePost && (
                  <motion.div
                    key="post-remove"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-xl border border-[var(--text-important)]/30 bg-[var(--text-important)]/10 p-3 text-xs font-medium text-[var(--text-important)]"
                  >
                    Switching to Member will remove {user.name}'s current post
                    {userPosts.length > 1 ? "s" : ""}: {userPosts.map((p) => p.title).join(", ")}.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[var(--btn-secondary-border)]">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={loading} 
                className="rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-app)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--stat-card-bg)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading} 
                className="rounded-xl bg-[var(--btn-primary-bg)] px-5 py-2 text-xs font-semibold text-[var(--btn-primary-text)] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}