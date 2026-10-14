"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3 } from "lucide-react";
import DeleteConfirmationModal from "@/components/ui/modal/DeleteConfirmationModal";
import AddEditSarokModal from "./AddEditSarokModal";
import SarokHeaderActions from "./SarokHeaderActions";

interface SarokCategory {
  code: string;
  name: string;
  shortName: string;
  _count?: { notices: number };
}

export default function SarokClientManager({ initialCategories }: { initialCategories: SarokCategory[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [editCategory, setEditCategory] = useState<SarokCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<SarokCategory | null>(null);

  // ক্লায়েন্ট সাইডে চোখের পলকে ফিল্টারিং (কোনো সার্ভার ল্যাগ বা ডিলে ছাড়া)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return initialCategories;
    const query = searchQuery.toLowerCase();
    return initialCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.code.toLowerCase().includes(query) ||
        cat.shortName.toLowerCase().includes(query)
    );
  }, [initialCategories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header with Instant Search */}
      <SarokHeaderActions
        totalCount={initialCategories.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Categories Table */}
      <div className="rounded-xl border border-(--border-color) bg-(--card-bg) overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border-color) bg-(--bg-app) text-[11px] uppercase tracking-wider text-(--text-secondary)">
                <th className="p-4">Code</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Short Name</th>
                <th className="p-4">Notices Count</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-color) text-xs text-(--text-primary)">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-(--text-secondary)">
                    No sarok categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.code} className="hover:bg-(--stat-card-bg)/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-(--btn-primary-bg)">{cat.code}</td>
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 font-mono">{cat.shortName}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {cat._count?.notices || 0} Notices
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setEditCategory(cat)}
                        className="p-1.5 rounded-md border border-(--border-color) hover:bg-(--bg-app) text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1.5 rounded-md border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editCategory && (
        <AddEditSarokModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          initialData={editCategory}
        />
      )}

      {categoryToDelete && (
        <DeleteConfirmationModal
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          itemTitle={categoryToDelete.name}
          itemType="Sarok Category"
          apiEndpoint={`/api/sarok?code=${categoryToDelete.code}`}
          warningMessage="Note: You cannot delete this category if there are active notices associated with it."
          onSuccess={() => {
            setCategoryToDelete(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}