"use client";

interface CommitteeFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedSession: string;
  setSelectedSession: (session: string) => void;
  types: string[];
  sessions: string[];
}

const formatType = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function CommitteeFilters({
  selectedType,
  setSelectedType,
  selectedSession,
  setSelectedSession,
  types,
  sessions,
}: CommitteeFiltersProps) {
  return (
    <div className="flex flex-col items-center gap-4 my-6">
      {/* Type Tabs - Segmented Control Style */}
      {types.length > 0 && (
        <div className="inline-flex p-1 rounded-xl bg-[var(--stat-card-bg)] border border-[var(--btn-secondary-border)]">
          {types.map((type) => {
            const isActive = selectedType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {formatType(type)}
              </button>
            );
          })}
        </div>
      )}

      {/* Session Chips */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sessions.map((session) => {
            const isActive = String(selectedSession) === String(session);
            return (
              <button
                key={session}
                onClick={() => setSelectedSession(session)}
                className={`px-3.5 py-1 text-xs font-medium rounded-full border transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "border-[var(--badge-text)] bg-[var(--badge-bg)] text-[var(--badge-text)]"
                    : "border-[var(--btn-secondary-border)] text-[var(--text-secondary)] hover:border-[var(--badge-text)]/50"
                }`}
              >
                {session}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}