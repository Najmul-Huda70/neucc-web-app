"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

export default function SecurityForm({
  onUpdateSuccess,
  onError,
}: {
  onUpdateSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Single Checkbox State for All Password Fields
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      if (onError) onError("New password and confirm password do not match");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (onUpdateSuccess) onUpdateSuccess("Password updated successfully!");
      } else {
        if (onError) onError(data.error || "Failed to update password");
      }
    } catch {
      if (onError) onError("An error occurred while updating password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <h2 className="text-sm sm:text-base font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
        Security & Password
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Current Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Common Checkbox for showing passwords */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="showPasswordToggle"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
        />
        <label htmlFor="showPasswordToggle" className="text-xs text-slate-600 cursor-pointer select-none">
          Show Passwords
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Updating..." : "Change Password"}
        </button>
      </div>
    </form>
  );
}