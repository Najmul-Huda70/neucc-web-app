"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import AddEditSarokModal from "./AddEditSarokModal";

interface SarokHeaderActionsProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export default function SarokHeaderActions({
  totalCount,
  searchQuery,
  onSearchChange,
}: SarokHeaderActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Title with Count */}
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Sarok Categories <span className="text-lg font-normal text-(--text-secondary)">({totalCount})</span>
        </h1>

        {/* Right side Actions: Instant SearchInput & Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <span className="sr-only">Search category...</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted)"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search category name..."
              className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs placeholder:text-(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0"
          >
            <Plus size={16} /> Add New Sarok
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <AddEditSarokModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}