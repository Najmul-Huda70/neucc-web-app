"use client";

interface UserSearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function UserSearchInput({ searchQuery, setSearchQuery }: UserSearchInputProps) {
  return (
    <div className="relative w-full group">
      {/* Search Icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-secondary) group-focus-within:text-(--btn-primary-bg) transition-colors pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full rounded-full border border-(--btn-secondary-border) bg-(--card-bg) pl-11 pr-10 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-secondary)/70 shadow-xs transition-all duration-200 focus:outline-hidden focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
      />

      {/* Clear Button */}
      {searchQuery.length > 0 && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-(--stat-card-bg) hover:bg-(--btn-secondary-border) text-(--text-secondary) flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}