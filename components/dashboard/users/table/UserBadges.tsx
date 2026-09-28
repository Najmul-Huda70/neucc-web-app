"use client";

import { Role, Status } from "@/lib/types";

const roleLabel = (r: Role | string) =>
  r === "MODERATOR" ? "Moderator" : r.charAt(0) + r.slice(1).toLowerCase();

export function RoleBadge({ role, onClick }: { role: Role | string; onClick: () => void }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-[var(--text-important)]/10 text-[var(--text-important)] border-[var(--text-important)]/30",
    MODERATOR: "bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-text)]/30",
    MEMBER: "bg-[var(--stat-card-bg)] text-[var(--text-secondary)] border-[var(--btn-secondary-border)]",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide transition-transform hover:scale-105 cursor-pointer ${
        styles[role] || styles.MEMBER
      }`}
    >
      {roleLabel(role)}
    </button>
  );
}

export function StatusBadge({ status, onClick }: { status: Status | string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-transform hover:scale-105 cursor-pointer ${
        status === "ACTIVE"
          ? "bg-[var(--badge-bg)] text-[var(--badge-text)]"
          : "bg-[var(--text-important)]/10 text-[var(--text-important)]"
      }`}
    >
      {status}
    </button>
  );
}