"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">Personal information</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Update the details associated with your administrator account.
        </p>
      </div>

      <div className="md:col-span-2 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setName(initialName);
              setEmail(initialEmail);
            }}
            className="px-4 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Discard changes
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}