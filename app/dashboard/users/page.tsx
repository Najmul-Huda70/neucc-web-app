"use client";

import { useEffect, useMemo, useState } from "react";
import { UserBase } from "@/lib/types";
import UsersTable from "@/components/dashboard/users/UsersTable";
import CreateUserModal from "@/components/dashboard/users/CreateUserModal";
import { UserSearchInput } from "@/components/dashboard/users/UserSearchFilterBar";
import { Loader2, Plus, Users } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<UserBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            User Management
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <UserSearchInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--btn-primary-bg)] hover:opacity-90 text-[var(--btn-primary-text)] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Main Content / Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text-secondary)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--btn-primary-bg)]" />
          <p className="text-sm font-medium">Loading Users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--btn-secondary-border)] rounded-2xl bg-[var(--card-bg)] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[var(--stat-card-bg)] flex items-center justify-center mb-3 text-[var(--text-secondary)]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            No users found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
            {searchQuery
              ? `No user matching "${searchQuery}" was found in the database.`
              : "There are currently no registered users available."}
          </p>
        </div>
      ) : (
        <UsersTable users={filteredUsers} onChanged={fetchUsers} />
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchUsers}
      />
    </div>
  );
}