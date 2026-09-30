"use client";

import { useEffect, useState } from "react";
import CommitteeFilters from "@/components/dashboard/committee/CommitteeFilters";
import JoinBanner from "@/components/public/JoinBanner";
import CreateCommitteeModal from "@/components/dashboard/committee/CreateCommitteeModal";
import { ApiResponse, Committee } from "@/lib/types";
import ExecutiveGrid from "@/components/dashboard/committee/ExecutiveGrid";

export default function CommitteePage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("EXECUTIVE");
  const [selectedyear, setSelectedyear] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/committees");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: ApiResponse<Committee[]> = await res.json();

      if (json.success && json.data) {
        setCommittees(json.data);

        if (json.data.length > 0) {
          const firstCommittee = json.data[0];
          const firstType = String(firstCommittee.type || "EXECUTIVE");
          const firstYear = String(firstCommittee.year ?? "");

          setSelectedType(firstType);
          setSelectedyear(firstYear);
        }
      }
    } catch (error) {
      console.error("Failed to fetch committee data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  // Filter valid years for currently selected type
  const availableyears = Array.from(
    new Set(
      committees
        .filter((c) => String(c.type).toLowerCase() === selectedType.toLowerCase())
        .map((c) => String(c.year))
    )
  );

  // Get all unique committee types
  const availableTypes = Array.from(
    new Set(committees.map((c) => String(c.type)))
  );

  if (availableTypes.length === 0) {
    availableTypes.push("EXECUTIVE", "ELECTION", "ADVISORY");
  }

  // Auto-switch year when selectedType or committees list changes
  useEffect(() => {
    if (availableyears.length > 0 && !availableyears.includes(selectedyear)) {
      setSelectedyear(availableyears[0]);
    }
  }, [selectedType, committees]);

  // Match active committee based on selected type and year
  const activeCommittee = committees.find(
    (c) =>
      String(c.type).toLowerCase() === selectedType.toLowerCase() &&
      String(c.year) === selectedyear
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-(--text-secondary) font-medium">
        Loading Committee Data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 bg-(--bg-app) text-(--text-primary)">
      {/* Top Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Committees
          </h1>
        </div>
      </div> */}

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