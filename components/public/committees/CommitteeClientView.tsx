"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import CreateCommitteeModal from "@/components/dashboard/committee/CreateCommitteeModal";
import AddPostModal from "@/components/dashboard/committee/AddPostModal";
import DeletePostModal from "@/components/dashboard/committee/DeletePostModal";
import ExecutiveGrid from "@/components/dashboard/committee/ExecutiveGrid";
import { getPublicCommittees } from "@/lib/services/committees";

type Props = {
  initialCommittees: Awaited<ReturnType<typeof getPublicCommittees>>;
  initialType: string;
  initialYear: string;
};

export default function CommitteeClientView({
  initialCommittees,
  initialType,
  initialYear,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isDeletePostOpen, setIsDeletePostOpen] = useState(false);

  // ১. ইউনিক টাইপগুলো বের করা
  const availableTypes = Array.from(
    new Set(initialCommittees.map((c) => String(c.type)))
  );
  if (availableTypes.length === 0) {
    availableTypes.push("EXECUTIVE", "ELECTION", "ADVISORY");
  }

  const currentType = availableTypes.includes(initialType)
    ? initialType
    : availableTypes[0];

  // ২. সিলেক্টেড টাইপের অধীনে উপলব্ধ বছরগুলো বের করা
  const availableYears = Array.from(
    new Set(
      initialCommittees
        .filter((c) => String(c.type).toLowerCase() === currentType.toLowerCase())
        .map((c) => String(c.year))
    )
  ).sort((a, b) => Number(b) - Number(a)); // ডিসেন্ডিং অর্ডার (যেমন: 2026, 2025...)

  const currentYear =
    availableYears.includes(initialYear) || availableYears.length === 0
      ? initialYear || availableYears[0] || ""
      : availableYears[0];

  // URL Parameter আপডেট করা
  const updateQuery = (type: string, year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    if (year) {
      params.set("year", year);
    } else {
      params.delete("year");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // বছর নেভিগেশন (< এবং >)
  const handleYearScroll = (direction: "left" | "right") => {
    const currentIndex = availableYears.indexOf(currentYear);
    if (currentIndex === -1) return;

    if (direction === "left" && currentIndex < availableYears.length - 1) {
      updateQuery(currentType, availableYears[currentIndex + 1]);
    } else if (direction === "right" && currentIndex > 0) {
      updateQuery(currentType, availableYears[currentIndex - 1]);
    }
  };

  // একটিভ কমিটি নির্ধারণ
  const activeCommittee = initialCommittees.find(
    (c) =>
      String(c.type).toLowerCase() === currentType.toLowerCase() &&
      String(c.year) === currentYear
  );

  // পোস্টগুলো প্রথম ২টি এবং বাকিগুলোর গ্রিডে ভাগ করা
  const posts = activeCommittee?.posts || [];
  const topTwoPosts = posts.slice(0, 2);
  const remainingPosts = posts.slice(2);

  return (
    <div className="space-y-8">
      {/* =========================================================
          1. Header Section: Title (Left) & Type Buttons (Right)
         ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-(--border-color)">
        <h1 className="text-2xl font-black tracking-tight text-(--text-primary) sm:text-3xl">
          Committee
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Executive / Election Buttons */}
          <div className="flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-bg) p-1 shadow-2xs">
            {availableTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  const firstYearForType =
                    initialCommittees
                      .filter(
                        (c) =>
                          String(c.type).toLowerCase() === type.toLowerCase()
                      )
                      .map((c) => String(c.year))[0] || "";
                  updateQuery(type, firstYearForType);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                  currentType.toLowerCase() === type.toLowerCase()
                    ? "bg-(--btn-primary-bg) text-(--btn-primary-text) shadow-xs"
                    : "text-(--text-muted) hover:text-(--text-primary) hover:bg-(--card-hover)"
                }`}
              >
                {type.toLowerCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            + Create
          </button>
        </div>
      </div>

      {/* =========================================================
          2. Year Filter Navigation (< year year year >)
         ========================================================= */}
      {initialCommittees.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {availableYears.length > 1 && (
            <button
              onClick={() => handleYearScroll("left")}
              className="p-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--text-primary) cursor-pointer"
              title="Older Year"
            >
              <ChevronLeft size={15} />
            </button>
          )}

          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => updateQuery(currentType, yr)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentYear === yr
                  ? "bg-(--btn-primary-bg) text-(--btn-primary-text) shadow-xs"
                  : "bg-(--card-bg) text-(--text-primary) border border-(--border-color) hover:bg-(--card-hover)"
              }`}
            >
              {yr}
            </button>
          ))}

          {availableYears.length > 1 && (
            <button
              onClick={() => handleYearScroll("right")}
              className="p-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--card-hover) text-(--text-primary) cursor-pointer"
              title="Newer Year"
            >
              <ChevronRight size={15} />
            </button>
          )}

          {availableYears.length === 0 && (
            <span className="text-xs text-(--text-muted)">No years available</span>
          )}
        </div>
      )}

      {/* =========================================================
          3. Grid Content: Top 2 Cards (Centered/Row 1) & Remaining (3 Columns)
         ========================================================= */}
      {!activeCommittee ? (
        <div className="text-center p-16 border border-dashed border-(--border-color) rounded-3xl bg-(--card-bg) my-6">
          <h3 className="text-sm font-bold text-(--text-primary)">
            No Committee Found
          </h3>
          <p className="text-xs text-(--text-muted) mt-1">
            There is no committee configured for {currentType} ({currentYear}).
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Action Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-color) pb-3">
            <h2 className="text-lg font-black tracking-tight text-(--text-primary)">
              {activeCommittee.type} Committee — {currentYear}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddPostOpen(true)}
                className="flex items-center gap-1.5 border border-emerald-600/40 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Post</span>
              </button>

              <button
                onClick={() => setIsDeletePostOpen(true)}
                className="flex items-center gap-1.5 border border-red-500/40 text-red-500 hover:bg-red-50 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Delete Post</span>
              </button>
            </div>
          </div>

          {/* Cards Layout matching wireframe */}
          <div className="space-y-6">
            {/* First Row: 2 Cards (e.g. President, Vice President / Key Leadership) */}
            {topTwoPosts.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <ExecutiveGrid posts={topTwoPosts} title="" />
              </div>
            )}

            {/* Sub-sequent Rows: 3 Columns Grid */}
            {remainingPosts.length > 0 && (
              <div>
                <ExecutiveGrid posts={remainingPosts} title="" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateCommitteeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {activeCommittee && (
        <>
          <AddPostModal
            isOpen={isAddPostOpen}
            onClose={() => setIsAddPostOpen(false)}
            committeeId={activeCommittee.committeeId}
            committeeTitle={`${activeCommittee.type} ${currentYear}`}
            onSuccess={() => router.refresh()}
          />

          <DeletePostModal
            isOpen={isDeletePostOpen}
            onClose={() => setIsDeletePostOpen(false)}
            committeeId={activeCommittee.committeeId}
            committeeTitle={`${activeCommittee.type} ${currentYear}`}
            onSuccess={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}