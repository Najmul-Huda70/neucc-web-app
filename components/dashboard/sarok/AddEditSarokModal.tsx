"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface SarokCategory {
  code: string;
  name: string;
  shortName: string;
}

interface AddEditSarokModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SarokCategory | null; // যদি এডিট মোড হয় তবে ডাটা পাস হবে
}

export default function AddEditSarokModal({
  isOpen,
  onClose,
  initialData,
}: AddEditSarokModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        shortName: initialData.shortName,
      });
    } else {
      setFormData({ code: "", name: "", shortName: "" });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = "/api/sarok";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message);
        onClose();
        router.refresh(); // পেজ রিফ্রেশ ছাড়াই সার্ভার ডাটা ও টেবিল আপডেট করবে
      } else {
        toast.error(json.error || "Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
          <h3 className="text-sm font-bold text-(--text-primary)">
            {isEditMode ? "Edit Sarok Category" : "Add New Sarok Category"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-(--text-secondary) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
              Category Code (e.g. 1002 or GA)
            </label>
            <input
              type="text"
              placeholder="1002"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={isEditMode} // এডিট মোডে কোড পরিবর্তন রেস্ট্রিক্টেড
              className="w-full rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-2 text-xs font-mono text-(--text-primary) disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
              Category Name (e.g. General Assembly)
            </label>
            <input
              type="text"
              placeholder="General Assembly"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-2 text-xs text-(--text-primary)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-(--text-secondary)">
              Short Name (e.g. GA)
            </label>
            <input
              type="text"
              placeholder="GA"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              className="w-full rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-2 text-xs font-mono text-(--text-primary)"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-(--border-color) text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-app)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-(--btn-primary-bg) text-(--btn-primary-text) text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {loading ? "Saving..." : isEditMode ? "Update Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}