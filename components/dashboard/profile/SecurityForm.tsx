"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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

  // ১টি স্টেটের মাধ্যমে সব ইনপুট ফিল্ড Show/Hide হবে
  const [showAllPassword, setShowAllPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  // পাসওয়ার্ড ভ্যালিডেশন নিয়ম
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter (a-z).";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one digit (0-9).";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&* etc.).";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePassword(newPassword);
    if (validationError) {
      if (onError) onError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      if (onError) onError("New password and confirm password do not match.");
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">Change password</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <div className="md:col-span-2 space-y-4">
        {/* Field 1: Current Password */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Current password</label>
          <input
            type={showAllPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
          />
        </div>

        {/* Field 2: New Password */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">New password</label>
          <input
            type={showAllPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Must be at least 8 characters with uppercase, lowercase, digit, and special symbol.
          </p>
        </div>

        {/* Field 3: Confirm New Password */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Confirm new password</label>
          <input
            type={showAllPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
          />
        </div>

        {/* Single Checkbox to Toggle All Passwords */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="showAllPasswordToggle"
            checked={showAllPassword}
            onChange={(e) => setShowAllPassword(e.target.checked)}
            className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 accent-teal-600 cursor-pointer"
          />
          <label
            htmlFor="showAllPasswordToggle"
            className="text-xs text-slate-600 font-medium cursor-pointer select-none"
          >
            Show passwords
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update password
          </button>
        </div>
      </div>
    </form>
  );
}