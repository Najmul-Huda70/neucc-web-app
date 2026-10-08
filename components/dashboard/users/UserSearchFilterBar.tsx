"use client";

import { Search, X } from "lucide-react";

interface UserSearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function UserSearchInput({ searchQuery, setSearchQuery }: UserSearchInputProps) {
  return (
    <div className="relative w-full group">
      {/* Search Icon - Event Style Green Tint */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10b981] pointer-events-none transition-transform duration-200 group-focus-within:scale-110" />

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search user name or email..."
        className="w-full rounded-xl border border-(--btn-secondary-border) bg-(--card-bg) pl-10 pr-9 py-2 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/60 shadow-2xs transition-all duration-200 focus:outline-hidden focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/15"
      />

      {/* Clear Button */}
      {searchQuery.length > 0 && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--stat-card-bg) transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}