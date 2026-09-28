"use client";

import { useState } from "react";
import { User, Mail, Save, Loader2 } from "lucide-react";

interface GeneralDetailsFormProps {
  initialName: string;
  initialEmail: string;
  onUpdateSuccess: () => void;
  onError: (msg: string) => void;
}

export default function GeneralDetailsForm({
  initialName,
  initialEmail,
  onUpdateSuccess,
  onError,
}: GeneralDetailsFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onUpdateSuccess();
      } else {
        onError(data.error || "Failed to update profile details.");
      }
    } catch {
      onError("An error occurred while saving profile info.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <h2 className="text-sm sm:text-base font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
        General Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Update Details"}
        </button>
      </div>
    </form>
  );
}