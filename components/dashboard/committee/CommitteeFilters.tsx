"use client";

interface CommitteeFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedyear: string;
  setSelectedyear: (year: string) => void;
  types: string[];
  years: string[];
}

const formatType = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function CommitteeFilters({
  selectedType,
  setSelectedType,
  selectedyear,
  setSelectedyear,
  types,
  years,
}: CommitteeFiltersProps) {
  return (
    <div className="flex flex-col items-center gap-4 my-6">
      {/* Type Tabs - Segmented Control Style */}
      {types.length > 0 && (
        <div className="inline-flex p-1 rounded-xl bg-(--stat-card-bg) border border-(--btn-secondary-border)">
          {types.map((type) => {
            const isActive = selectedType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-(--btn-primary-bg) text-(--btn-primary-text) shadow-xs"
                    : "text-(--text-secondary) hover:text-(--text-primary)"
                }`}
              >
                {formatType(type)}
              </button>
            );
          })}
        </div>
      )}

      {/* year Chips */}
      {years.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {years.map((year) => {
            const isActive = String(selectedyear) === String(year);
            return (
              <button
                key={year}
                onClick={() => setSelectedyear(year)}
                className={`px-3.5 py-1 text-xs font-medium rounded-full border transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "border-(--badge-text) bg-(--badge-bg) text-(--badge-text)"
                    : "border-(--btn-secondary-border) text-(--text-secondary) hover:border-(--badge-text)/50"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}