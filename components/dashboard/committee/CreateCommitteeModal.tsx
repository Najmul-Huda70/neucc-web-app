"use client";

import { useState } from "react";

interface CreateCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCommitteeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommitteeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "EXECUTIVE",
    year: new Date().getFullYear(), // ডিফল্ট বর্তমান বছর রাখা ভাল (যেমন: 2026)
    postTitle: "President",
    adminUserId: "",
    adminName: "",
    adminEmail: "",
  });

  if (!isOpen) return null;

  // 1. CHANGE HERE: handleChange আপডেট করা হলো
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/committees/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year), // নিরাপদ থাকার জন্য পাঠানোর সময় নিশ্চিত Int করে দেওয়া হলো
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create committee");
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-(--card-bg) p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--btn-secondary-border) pb-4">
          <h2 className="text-xl font-bold text-(--text-primary)">
            Create New Committee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-(--text-secondary) hover:bg-(--stat-card-bg) hover:text-(--text-primary) cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-(--text-important)/30 bg-(--text-important)/10 p-3 text-xs text-(--text-important)">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Committee Type */}
            <div>
              <label className="block text-xs font-semibold text-(--text-primary)">
                Committee Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
              >
                <option value="EXECUTIVE">Executive</option>
                <option value="ELECTION">Election</option>
                <option value="ADVISORY">Advisory</option>
              </select>
            </div>

            {/* Committee Year */}
            <div>
              <label className="block text-xs font-semibold text-(--text-primary)">
                Year (e.g. 2026)
              </label>
              {/* 2. CHANGE HERE: type="number" করা হয়েছে */}
              <input
                type="number"
                name="year"
                required
                value={formData.year}
                onChange={handleChange}
                placeholder="2026"
                className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
              />
            </div>
          </div>

          {/* Post Title */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary)">
              Admin Post Title
            </label>
            <input
              type="text"
              name="postTitle"
              required
              value={formData.postTitle}
              onChange={handleChange}
              placeholder="e.g. President"
              className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
            />
          </div>

          <div className="border-t border-(--btn-secondary-border) pt-3">
            <p className="mb-3 text-xs font-semibold text-(--text-secondary)">
              Initial Admin Details
            </p>

            <div className="space-y-3">
              {/* Admin User ID */}
              <div>
                <label className="block text-xs font-medium text-(--text-primary)">
                  User ID / Student ID
                </label>
                <input
                  type="text"
                  name="adminUserId"
                  required
                  value={formData.adminUserId}
                  onChange={handleChange}
                  placeholder="e.g. 2023001"
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
                />
              </div>

              {/* Admin Name */}
              <div>
                <label className="block text-xs font-medium text-(--text-primary)">
                  Full Name
                </label>
                <input
                  type="text"
                  name="adminName"
                  required
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
                />
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-xs font-medium text-(--text-primary)">
                  Email Address
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="user@neu.ac.bd"
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) text-(--text-primary) p-2.5 text-xs focus:border-(--btn-primary-bg) focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-(--btn-secondary-border) px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--stat-card-bg) cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-(--btn-primary-bg) px-5 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Committee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}