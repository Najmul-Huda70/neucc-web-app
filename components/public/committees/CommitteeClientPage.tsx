"use client";

import { useState, useEffect } from "react";
import CommitteeFilters from "@/components/dashboard/committee/CommitteeFilters";
import JoinBanner from "@/components/public/JoinBanner";
import ExecutiveGrid from "@/components/dashboard/committee/ExecutiveGrid";
import { Committee } from "@/lib/types";

type Props = {
  initialCommittees: Committee[];
};

export default function CommitteeClientPage({ initialCommittees }: Props) {
  const [committees] = useState<Committee[]>(initialCommittees);

  // Default initial selection setup
  const firstCommittee = committees[0];
  const initialType = firstCommittee ? String(firstCommittee.type || "EXECUTIVE") : "EXECUTIVE";
  const initialYear = firstCommittee ? String(firstCommittee.year ?? "") : "";

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedyear, setSelectedyear] = useState<string>(initialYear);

  // Get unique types
  const availableTypes = Array.from(
    new Set(committees.map((c) => String(c.type)))
  );

  if (availableTypes.length === 0) {
    availableTypes.push("EXECUTIVE", "ELECTION", "ADVISORY");
  }

  // Filter valid years for currently selected type
  const availableyears = Array.from(
    new Set(
      committees
        .filter((c) => String(c.type).toLowerCase() === selectedType.toLowerCase())
        .map((c) => String(c.year))
    )
  );

  // Auto-switch year when selectedType changes if current year is not available
  useEffect(() => {
    if (availableyears.length > 0 && !availableyears.includes(selectedyear)) {
      setSelectedyear(availableyears[0]);
    }
  }, [selectedType, availableyears, selectedyear]);

  // Match active committee based on selected type and year
  const activeCommittee = committees.find(
    (c) =>
      String(c.type).toLowerCase() === selectedType.toLowerCase() &&
      String(c.year) === selectedyear
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 bg-(--bg-app) text-(--text-primary)">
      {committees.length > 0 && (
        <CommitteeFilters
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedyear={selectedyear}
          setSelectedyear={setSelectedyear}
          types={availableTypes}
          years={availableyears}
        />
      )}

      {!activeCommittee ? (
        <div className="text-center p-12 border border-dashed border-(--btn-secondary-border) rounded-3xl bg-(--stat-card-bg) my-10">
          <h3 className="text-base font-semibold text-(--text-primary)">
            No Committee Found
          </h3>
          <p className="text-xs text-(--text-secondary) mt-1">
            There is no committee configured for {selectedType} ({selectedyear}).
          </p>
        </div>
      ) : (
        <ExecutiveGrid
          posts={activeCommittee.posts}
          title={`${activeCommittee.type} Committee - ${selectedyear}`}
        />
      )}

      <JoinBanner />
    </div>
  );
}