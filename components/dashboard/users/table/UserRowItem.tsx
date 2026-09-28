"use client";

import { motion } from "framer-motion";
import { RoleBadge, StatusBadge } from "./UserBadges";
import { UserRow } from "../UsersTable";

// Helper to extract post titles
export function getPostTitles(u: UserRow): string | null {
  if (u.user_posts && u.user_posts.length > 0) {
    const titles = u.user_posts
      .map((up) => up.post?.postTitle)
      .filter(Boolean)
      .join(", ");
    return titles || null;
  }
  if (u.posts && u.posts.length > 0) {
    return u.posts.map((p) => p.postTitle).join(", ");
  }
  return null;
}

interface UserRowItemProps {
  user: UserRow;
  isBusy: boolean;
  viewMode: "desktop" | "mobile";
  onRoleClick: () => void;
  onStatusClick: () => void;
  onDeleteClick: () => void;
}

export default function UserRowItem({
  user,
  isBusy,
  viewMode,
  onRoleClick,
  onStatusClick,
  onDeleteClick,
}: UserRowItemProps) {
  const postTitles = getPostTitles(user);

  if (viewMode === "desktop") {
    return (
      <motion.tr
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="border-t border-[var(--btn-secondary-border)] text-[var(--text-primary)]"
      >
        <td className="p-3 font-medium">
          {user.name}
          {postTitles && (
            <div className="text-[10px] font-normal text-[var(--text-secondary)]">{postTitles}</div>
          )}
        </td>
        <td className="p-3 text-[var(--text-secondary)]">{user.email}</td>
        <td className="p-3">
          <RoleBadge role={user.role} onClick={onRoleClick} />
        </td>
        <td className="p-3">
          <StatusBadge status={user.status} onClick={onStatusClick} />
        </td>
        <td className="p-3 text-right">
          <button
            onClick={onDeleteClick}
            disabled={isBusy}
            className="rounded-lg border border-[var(--text-important)]/40 px-2.5 py-1 text-[10px] font-semibold text-[var(--text-important)] hover:bg-[var(--text-important)]/10 disabled:opacity-50 cursor-pointer"
          >
            Delete
          </button>
        </td>
      </motion.tr>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.name}</p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate">{user.email}</p>
          {postTitles && (
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{postTitles}</p>
          )}
        </div>
        <StatusBadge status={user.status} onClick={onStatusClick} />
      </div>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--btn-secondary-border)]">
        <RoleBadge role={user.role} onClick={onRoleClick} />
        <button
          onClick={onDeleteClick}
          disabled={isBusy}
          className="rounded-lg border border-[var(--text-important)]/40 px-2 py-1 text-[10px] font-semibold text-[var(--text-important)] hover:bg-[var(--text-important)]/10 disabled:opacity-50 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}