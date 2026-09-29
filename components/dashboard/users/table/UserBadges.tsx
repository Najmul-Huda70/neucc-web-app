"use client";

import { Role, Status } from "@/lib/types";

const roleLabel = (r: Role | string) =>
  r === "MODERATOR" ? "Moderator" : r.charAt(0) + r.slice(1).toLowerCase();

export function RoleBadge({ role, onClick }: { role: Role | string; onClick: () => void }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-(--text-important)/10 text-(--text-important) border-(--text-important)/30",
    MODERATOR: "bg-(--badge-bg) text-(--badge-text) border-(--badge-text)/30",
    MEMBER: "bg-(--stat-card-bg) text-(--text-secondary) border-(--btn-secondary-border)",
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
          ? "bg-(--badge-bg) text-(--badge-text)"
          : "bg-(--text-important)/10 text-(--text-important)"
      }`}
    >
      {status}
    </button>
  );
}