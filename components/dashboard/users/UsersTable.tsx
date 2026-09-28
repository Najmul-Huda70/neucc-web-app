"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { UserBase } from "@/lib/types";
import ColumnFilterDropdown from "./ColumnFilterDropdown";
import UserRowItem from "./table/UserRowItem";
import StatusChangeModal, { StatusType } from "@/components/dashboard/users/StatusChangeModal";
import CloseUserModal from "./CloseUserModal";
import RoleChangeModal from "./RoleChangeModal";

export interface UserRow extends UserBase {
  posts?: { postId: string; postTitle: string }[];
  user_posts?: {
    postId: string;
    committeeId: string;
    post?: { postTitle: string };
    committee?: { year: string; type: string };
  }[];
}

interface UsersTableProps {
  users: UserRow[];
  onChanged: () => void;
}

const ROLE_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Moderator", value: "MODERATOR" },
  { label: "Member", value: "MEMBER" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Deactivated", value: "DEACTIVATED" },
  { label: "Closed", value: "CLOSED" },
];

export default function UsersTable({ users, onChanged }: UsersTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [nameSort, setNameSort] = useState<"default" | "asc" | "desc">("default");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const [roleChangeUser, setRoleChangeUser] = useState<UserRow | null>(null);
  const [statusChangeUser, setStatusChangeUser] = useState<UserRow | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserRow | null>(null);

  const patchUser = async (userId: string, patch: Record<string, unknown>) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Update failed.");
        return false;
      }
      onChanged();
      return true;
    } catch {
      alert("An error occurred while updating the user.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleSubmit = async (payload: { role: string }) => {
    if (!roleChangeUser) return;
    if (await patchUser(roleChangeUser.userId, payload)) {
      setRoleChangeUser(null);
    }
  };

  // Status Modal Dropdown Confirm Handler
  const handleStatusConfirm = async (newStatus: StatusType) => {
    if (!statusChangeUser) return;
    const success = await patchUser(statusChangeUser.userId, { status: newStatus });
    if (success) {
      setStatusChangeUser(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserTarget) return;
    setBusyId(deleteUserTarget.userId);
    try {
      const res = await fetch("/api/users/delete/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteUserTarget.userId }),
      });
      if (res.ok) {
        setDeleteUserTarget(null);
        onChanged();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete user.");
      }
    } catch {
      alert("An error occurred while deleting user.");
    } finally {
      setBusyId(null);
    }
  };

  const displayedUsers = useMemo(() => {
    let list = [...users];
    if (roleFilter.length > 0) {
      list = list.filter((u) => roleFilter.includes(u.role));
    }
    if (statusFilter.length > 0) {
      list = list.filter((u) => statusFilter.includes(u.status));
    }
    if (nameSort !== "default") {
      list.sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameSort === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }
    return list;
  }, [users, roleFilter, statusFilter, nameSort]);

  const cycleNameSort = () =>
    setNameSort((s) => (s === "default" ? "asc" : s === "asc" ? "desc" : "default"));

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[var(--btn-secondary-border)] rounded-3xl bg-[var(--card-bg)] shadow-xs">
        <div className="p-3.5 rounded-full bg-[var(--stat-card-bg)] text-[var(--text-secondary)] mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-[var(--text-primary)] font-semibold text-base mb-1">
          No users found
        </p>
        <p className="text-[var(--text-secondary)] text-xs text-center max-w-sm">
          No user matching your search or filter was found in the database.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / Tablet Layout */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)]">
        <table className="w-full text-left text-xs table-fixed">
          <thead className="bg-[var(--stat-card-bg)] text-[var(--text-secondary)] border-b border-[var(--btn-secondary-border)]">
            <tr>
              <th className="p-3">
                <button
                  onClick={cycleNameSort}
                  className="flex items-center gap-1 font-semibold hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Name <span className="text-[10px]">{nameSort === "asc" ? "▲" : nameSort === "desc" ? "▼" : "↕"}</span>
                </button>
              </th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3">
                <ColumnFilterDropdown
                  label="Role"
                  options={ROLE_OPTIONS}
                  selected={roleFilter}
                  onChange={setRoleFilter}
                />
              </th>
              <th className="p-3">
                <ColumnFilterDropdown
                  label="Status"
                  options={STATUS_OPTIONS}
                  selected={statusFilter}
                  onChange={setStatusFilter}
                />
              </th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {displayedUsers.map((u) => (
                <UserRowItem
                  key={u.userId}
                  user={u}
                  viewMode="desktop"
                  isBusy={busyId === u.userId}
                  onRoleClick={() => setRoleChangeUser(u)}
                  onStatusClick={() => setStatusChangeUser(u)}
                  onDeleteClick={() => setDeleteUserTarget(u)}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Layout */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            onClick={cycleNameSort}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
          >
            Sort by name <span className="text-[10px]">{nameSort === "asc" ? "▲" : nameSort === "desc" ? "▼" : "↕"}</span>
          </button>
          <div className="flex gap-3">
            <ColumnFilterDropdown
              label="Role"
              options={ROLE_OPTIONS}
              selected={roleFilter}
              onChange={setRoleFilter}
            />
            <ColumnFilterDropdown
              label="Status"
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {displayedUsers.map((u) => (
            <UserRowItem
              key={u.userId}
              user={u}
              viewMode="mobile"
              isBusy={busyId === u.userId}
              onRoleClick={() => setRoleChangeUser(u)}
              onStatusClick={() => setStatusChangeUser(u)}
              onDeleteClick={() => setDeleteUserTarget(u)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={!!roleChangeUser}
        user={roleChangeUser}
        loading={busyId === roleChangeUser?.userId}
        onClose={() => setRoleChangeUser(null)}
        onSubmit={handleRoleSubmit}
      />

      {/* New Status Change Dropdown Modal */}
      <StatusChangeModal
        isOpen={!!statusChangeUser}
        userName={statusChangeUser?.name || "User"}
        currentStatus={(statusChangeUser?.status as StatusType) || "ACTIVE"}
        onClose={() => setStatusChangeUser(null)}
        onConfirm={handleStatusConfirm}
      />

      {/* User Closed Modal */}
      <CloseUserModal
        isOpen={!!deleteUserTarget}
        userName={deleteUserTarget?.name || "User"}
        loading={busyId === deleteUserTarget?.userId}
        onCancel={() => setDeleteUserTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}