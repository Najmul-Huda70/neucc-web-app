"use client";

import { useEffect, useState } from "react";
import CommitteeFilters from "@/components/CommitteeFilters";
import ExecutiveGrid from "@/components/ExecutiveGrid";
import JoinBanner from "@/components/JoinBanner";
import CreateCommitteeModal from "@/components/CreateCommitteeModal";
import { ApiResponse, Committee } from "@/lib/types";

export default function CommitteePage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>("EXECUTIVE");
  const [selectedSession, setSelectedSession] = useState<string>("");
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
          const firstType = json.data[0].type || "EXECUTIVE";
          const firstSession = json.data[0].session || String(json.data[0].year);
          setSelectedType(firstType);
          setSelectedSession(firstSession);
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

  // Filter valid sessions for currently selected type
  const availableSessions = Array.from(
    new Set(
      committees
        .filter((c) => String(c.type).toLowerCase() === selectedType.toLowerCase())
        .map((c) => String(c.session || c.year))
    )
  );

  // Auto-switch session when selectedType changes
  useEffect(() => {
    if (
      availableSessions.length > 0 &&
      !availableSessions.includes(selectedSession)
    ) {
      setSelectedSession(availableSessions[0]);
    }
  }, [selectedType, committees]); // eslint-disable-line react-hooks/exhaustive-deps

  // Match active committee
  const activeCommittee = committees.find(
    (c) =>
      String(c.type).toLowerCase() === selectedType.toLowerCase() &&
      String(c.session || c.year) === selectedSession
  );

  // Get all unique committee types
  const availableTypes = Array.from(new Set(committees.map((c) => String(c.type))));
  if (availableTypes.length === 0) {
    availableTypes.push("EXECUTIVE", "ELECTION", "ADVISORY");
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-[var(--text-secondary)] font-medium">
        Loading Committee Data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Committee Management
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--btn-primary-bg)] hover:opacity-90 text-[var(--btn-primary-text)] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto shadow-xs cursor-pointer"
        >
          + Create New Committee
        </button>
      </div>

      {committees.length > 0 && (
        <CommitteeFilters
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          types={availableTypes}
          sessions={availableSessions}
        />
      )}

      {!activeCommittee ? (
        <div className="text-center p-12 border border-dashed border-[var(--btn-secondary-border)] rounded-3xl bg-[var(--stat-card-bg)] my-10">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            No Committee Found
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            There is no committee configured for {selectedType} ({selectedSession}).
          </p>
        </div>
      ) : (
        <ExecutiveGrid
          posts={activeCommittee.posts}
          title={`${activeCommittee.type} Committee - ${selectedSession}`}
        />
      )}

      <CreateCommitteeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCommittees}
      />

      <JoinBanner />
    </div>
  );
}