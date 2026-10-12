"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ExecutiveGrid from "@/components/dashboard/committee/ExecutiveGrid";
import JoinBanner from "@/components/public/JoinBanner";
import Button from "@/components/ui/Button"; // আপনার Reusable Button Import
import { getPublicCommittees } from "@/lib/services/committees";

type Props = {
  initialCommittees: Awaited<ReturnType<typeof getPublicCommittees>>;
};

export default function CommitteeClientPage({ initialCommittees }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters থেকে বর্তমান সিলেক্টেড মানগুলো নেওয়া
  const initialType = searchParams.get("type") || "";
  const initialYear = searchParams.get("year") || "";

  // ১. ইউনিক কমিটি টাইপগুলো বের করা
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

  // পোস্টগুলোকে প্রথম ২টি এবং বাকি অংশে ভাগ করা
  const posts = activeCommittee?.posts || [];
  const topTwoPosts = posts.slice(0, 2);
  const remainingPosts = posts.slice(2);

  return (
    <div className="">
      {/* =========================================================
          1. Header Section: Title (Left) & Type Buttons (Right)
         ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl font-black tracking-tight text-(--text-primary) sm:text-3xl">
          Committee
        </h1>

        {/* Executive / Election Type Buttons using Button Component */}
        <div className="flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-bg) p-1 shadow-2xs self-start sm:self-auto">
          {availableTypes.map((type) => {
            const isActive = currentType.toLowerCase() === type.toLowerCase();
            return (
              <Button
                key={type}
                variant={isActive ? "primary" : "ghost"}
                size="sm"
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
                className={`capitalize font-bold text-xs ${
                  !isActive ? "text-(--text-muted) hover:text-(--text-primary)" : ""
                }`}
              >
                {type.toLowerCase()}
              </Button>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          2. Year Filter Navigation (< year year year >)
         ========================================================= */}
      {initialCommittees.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Previous Year Button (<) */}
          {availableYears.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearScroll("left")}
              aria-label="Older Year"
              className="p-2"
            >
              <ChevronLeft size={15} />
            </Button>
          )}

          {/* Year Pills */}
          {availableYears.map((yr) => {
            const isActive = currentYear === yr;
            return (
              <Button
                key={yr}
                variant={isActive ? "primary" : "outline"}
                size="sm"
                onClick={() => updateQuery(currentType, yr)}
                className="font-semibold text-xs"
              >
                {yr}
              </Button>
            );
          })}

          {/* Next Year Button (>) */}
          {availableYears.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleYearScroll("right")}
              aria-label="Newer Year"
              className="p-2"
            >
              <ChevronRight size={15} />
            </Button>
          )}

          {availableYears.length === 0 && (
            <span className="text-xs text-(--text-muted)">No years available</span>
          )}
        </div>
      )}

      {/* =========================================================
          3. Grid Content Layout (Matching Wireframe Layout)
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
          {/* Cards Layout matching wireframe */}
          <div className="space-y-6">
            {/* First Row: Top 2 Leadership Cards */}
            {topTwoPosts.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <ExecutiveGrid posts={topTwoPosts} title="" />
              </div>
            )}

            {/* Sub-sequent Rows: Remaining Member Cards */}
            {remainingPosts.length > 0 && (
              <div>
                <ExecutiveGrid posts={remainingPosts} title="" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}