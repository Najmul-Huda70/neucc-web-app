"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Loader2,
  X,
  UserPlus,
  Trash2,
  KeyRound,
  ShieldAlert,
  Building2,
  AlertTriangle,
  History,
  Filter,
} from "lucide-react";
import PreviousCommitteeCard from "@/components/dashboard/PreviousCommitteeCard";
import CommitteeCard, { CommitteeItem } from "@/components/dashboard/ActiveCommitteeCard";

interface AdminInput {
  userId: string;
  name: string;
  email: string;
  postTitle: string;
}

const ALL_COMMITTEE_TYPES = ["EXECUTIVE", "ADVISOR", "ELECTION"] as const;
type CommitteeType = (typeof ALL_COMMITTEE_TYPES)[number];

export default function CommitteeManagementPage() {
  const [activeCommittees, setActiveCommittees] = useState<CommitteeItem[]>([]);
  const [previousCommittees, setPreviousCommittees] = useState<CommitteeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State for Previous Committees
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Modal States for Create Committee
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [committeeType, setCommitteeType] = useState<CommitteeType>("EXECUTIVE");
  const [session, setSession] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [adminsInput, setAdminsInput] = useState<AdminInput[]>([
    { userId: "", name: "", email: "", postTitle: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Confirmation Modal States for Block Action
  const [selectedCommitteeToBlock, setSelectedCommitteeToBlock] = useState<CommitteeItem | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const fetchCommittees = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/committees");
      const data = await res.json();
      if (res.ok) {
        const all: CommitteeItem[] = data.committees || [];
        setActiveCommittees(all.filter((c) => c.status === "ACTIVE"));
        setPreviousCommittees(all.filter((c) => c.status !== "ACTIVE"));
      }
    } catch (e) {
      console.error("Fetch Committees Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  const filteredPreviousCommittees = useMemo(() => {
    if (selectedFilter === "ALL") return previousCommittees;
    return previousCommittees.filter((c) => c.type === selectedFilter);
  }, [previousCommittees, selectedFilter]);

  // Executive vs Election Mutual Exclusion & Existing Type Check
  const availableTypesForCreation = useMemo(() => {
    const activeTypes = new Set(activeCommittees.map((c) => c.type));

    return ALL_COMMITTEE_TYPES.filter((type) => {
      // 1. Same active type check
      if (activeTypes.has(type)) return false;

      // 2. Executive vs Election Conflict Rule
      if (type === "ELECTION" && activeTypes.has("EXECUTIVE")) return false;
      if (type === "EXECUTIVE" && activeTypes.has("ELECTION")) return false;

      return true;
    });
  }, [activeCommittees]);

  const handleOpenModal = () => {
    if (availableTypesForCreation.length === 0) {
      alert("No committee type is available for creation based on current active rules!");
      return;
    }
    setCommitteeType(availableTypesForCreation[0]);
    setIsModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedCommitteeToBlock) return;
    setBlockError("");

    if (!blockReason.trim()) {
      setBlockError("Please provide a reason for blocking this committee.");
      return;
    }

    try {
      setIsBlocking(true);
      const res = await fetch(`/api/committees/${selectedCommitteeToBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "BLOCKED",
          blockReason: blockReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to block committee");

      const blockedItem = { ...selectedCommitteeToBlock, status: "BLOCKED" };
      setActiveCommittees((prev) => prev.filter((c) => c.id !== selectedCommitteeToBlock.id));
      setPreviousCommittees((prev) => [blockedItem, ...prev]);

      setSelectedCommitteeToBlock(null);
      setBlockReason("");
    } catch (err: any) {
      setBlockError(err.message || "Error blocking committee!");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleAddAdminField = () => {
    if (adminsInput.length < 2) {
      setAdminsInput([...adminsInput, { userId: "", name: "", email: "", postTitle: "" }]);
    }
  };

  const handleRemoveAdminField = (index: number) => {
    if (adminsInput.length > 1) {
      setAdminsInput(adminsInput.filter((_, i) => i !== index));
    }
  };

  const handleAdminInputChange = (index: number, field: keyof AdminInput, value: string) => {
    const updated = [...adminsInput];
    updated[index][field] = value;
    setAdminsInput(updated);
  };

  const resetForm = () => {
    setCommitteeType(availableTypesForCreation[0] || "EXECUTIVE");
    setSession("");
    setStatus("ACTIVE");
    setAdminsInput([{ userId: "", name: "", email: "", postTitle: "" }]);
    setModalError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!session.trim()) {
      setModalError("Session is required.");
      return;
    }

    for (let admin of adminsInput) {
      if (!admin.userId.trim() || !admin.name.trim() || !admin.email.trim() || !admin.postTitle.trim()) {
        setModalError("Please complete all details for each Admin.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: committeeType,
          session,
          status,
          admins: adminsInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create committee");

      alert("Committee and Admins created successfully!");
      handleCloseModal();
      fetchCommittees();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Committee Management
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage active committees and view historical committee records.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          disabled={availableTypesForCreation.length === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            availableTypesForCreation.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:opacity-90"
          }`}
          style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
        >
          <Plus size={18} /> Add Committee
        </button>
      </div>

      {/* SECTION 1: ACTIVE COMMITTEES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-lg font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
            Active Committees
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        ) : activeCommittees.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-2xl p-6" style={{ borderColor: "var(--btn-secondary-border)" }}>
            <Building2 className="mx-auto mb-2 text-gray-400" size={36} />
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>No Active Committees Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeCommittees.map((committee) => (
              <CommitteeCard
                key={committee.id}
                committee={committee}
                onBlockRequest={(item) => {
                  setSelectedCommitteeToBlock(item);
                  setBlockReason("");
                  setBlockError("");
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: PREVIOUS COMMITTEES */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <div className="flex items-center gap-2">
            <History className="text-gray-400" size={20} />
            <h2 className="text-lg font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
              Previous Committees
            </h2>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl border text-xs" style={{ borderColor: "var(--btn-secondary-border)" }}>
            <Filter size={14} className="ml-1.5 text-gray-400" />
            {["ALL", "EXECUTIVE", "ADVISOR", "ELECTION"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  selectedFilter === type
                    ? "bg-teal-600 text-white shadow-sm"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-gray-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        ) : filteredPreviousCommittees.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-2xl p-6" style={{ borderColor: "var(--btn-secondary-border)" }}>
            <p className="font-semibold text-sm text-gray-400">No previous committees found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPreviousCommittees.map((committee) => (
              <PreviousCommitteeCard key={committee.id} committee={committee} />
            ))}
          </div>
        )}
      </section>

      {/* Block Confirmation Modal with Reason */}
      {selectedCommitteeToBlock && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold">Block Committee?</h3>
            </div>

            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to block the <span className="font-bold text-red-500">{selectedCommitteeToBlock.type}</span> committee (Session: {selectedCommitteeToBlock.session})?
            </p>

            {blockError && (
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={14} /> {blockError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>
                Reason for Blocking (Sent via Email)
              </label>
              <textarea
                rows={3}
                placeholder="Enter reason for blocking committee and associated members..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-xs focus:outline-none"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
              />
            </div>

            <strong className="text-red-500 font-semibold text-xs block">
              Note: Blocking this committee will automatically block all associated posts and users, and notify them via email!
            </strong>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCommitteeToBlock(null);
                  setBlockReason("");
                }}
                disabled={isBlocking}
                className="flex-1 py-2.5 rounded-xl border font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={isBlocking}
                className="flex-1 py-2.5 rounded-xl font-semibold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                {isBlocking ? <Loader2 className="animate-spin" size={16} /> : "Yes, Block Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Committee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div
            className="rounded-2xl max-w-xl w-full p-6 shadow-2xl border space-y-4 my-8"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--btn-secondary-border)" }}>
              <h2 className="text-lg font-bold">Create Committee & Assign Admins</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-lg border hover:opacity-80">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={16} /> {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCommittee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Committee Type</label>
                  <select
                    value={committeeType}
                    onChange={(e) => setCommitteeType(e.target.value as CommitteeType)}
                    className="w-full p-2.5 rounded-xl border focus:outline-none cursor-pointer"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                  >
                    {availableTypesForCreation.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1" style={{ color: "var(--text-secondary)" }}>Session</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-2027"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full p-2.5 rounded-xl border focus:outline-none"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {/* Dynamic Admin Inputs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    Assigned Admins & Posts (Max 2)
                  </span>
                  {adminsInput.length < 2 && (
                    <button type="button" onClick={handleAddAdminField} className="text-teal-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                      <UserPlus size={14} /> Add 2nd Admin
                    </button>
                  )}
                </div>

                {adminsInput.map((admin, idx) => (
                  <div key={idx} className="p-3 border rounded-xl space-y-2 bg-black/5 dark:bg-white/5 relative" style={{ borderColor: "var(--btn-secondary-border)" }}>
                    <div className="flex justify-between items-center font-bold text-teal-600">
                      <span>Admin Position #{idx + 1}</span>
                      {adminsInput.length > 1 && (
                        <button type="button" onClick={() => handleRemoveAdminField(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Post Title (e.g. President)"
                        value={admin.postTitle}
                        onChange={(e) => handleAdminInputChange(idx, "postTitle", e.target.value)}
                        className="w-full p-2 rounded-lg border focus:outline-none"
                        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                      />
                      <input
                        type="text"
                        placeholder="User / Reg ID"
                        value={admin.userId}
                        onChange={(e) => handleAdminInputChange(idx, "userId", e.target.value)}
                        className="w-full p-2 rounded-lg border focus:outline-none"
                        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={admin.name}
                        onChange={(e) => handleAdminInputChange(idx, "name", e.target.value)}
                        className="w-full p-2 rounded-lg border focus:outline-none"
                        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={admin.email}
                        onChange={(e) => handleAdminInputChange(idx, "email", e.target.value)}
                        className="w-full p-2 rounded-lg border focus:outline-none"
                        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--btn-secondary-border)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "var(--btn-secondary-border)" }}>
                <button type="button" onClick={handleCloseModal} className="flex-1 py-2.5 rounded-xl border font-semibold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />} Save & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}