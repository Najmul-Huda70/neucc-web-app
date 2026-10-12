import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublicCommittees } from "@/lib/services/committees";
import JoinBanner from "@/components/public/JoinBanner";
import CommitteeClientView from "@/components/public/committees/CommitteeClientView";

export const metadata: Metadata = {
  title: "Committee Management | NEU Computer Club",
  description: "Explore and manage executive and election committees across different years.",
};

type PageProps = {
  searchParams: Promise<{ type?: string; year?: string }>;
};

export default async function CommitteePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  // ডিফল্ট ভ্যালু সেট করা
  const selectedType = resolvedParams.type || "EXECUTIVE";
  const selectedYear = resolvedParams.year || "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 bg-(--bg-app) text-(--text-primary)">
      <Suspense key={`${selectedType}-${selectedYear}`} fallback={<CommitteeSkeleton />}>
        <AsyncCommitteeContent selectedType={selectedType} selectedYear={selectedYear} />
      </Suspense>

      <JoinBanner />
    </div>
  );
}

// অ্যাসিনক্রোনাস ডেটা ফেচিং এবং রেন্ডারিং কম্পোনেন্ট
async function AsyncCommitteeContent({
  selectedType,
  selectedYear,
}: {
  selectedType: string;
  selectedYear: string;
}) {
  // Direct Server Service Call
  const committees = await getPublicCommittees();

  return (
    <CommitteeClientView
      initialCommittees={committees}
      initialType={selectedType}
      initialYear={selectedYear}
    />
  );
}

// ওয়্যারফ্রেম এবং কার্ড লেআউটের সাথে মিল রেখে স্কেলিটন
function CommitteeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-(--border-color)">
        <div className="h-8 w-48 rounded-md bg-(--border-color)/40" />
        <div className="h-10 w-32 rounded-xl bg-(--border-color)/40" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-16 rounded-lg bg-(--border-color)/30" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-8 w-24 rounded-lg bg-(--border-color)/30" />
          ))}
        </div>
      </div>

      {/* Grid Skeletons matching the wireframe layout */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-72 w-full rounded-2xl border border-(--border-color) bg-(--card-bg)"
          />
        ))}
      </div>
    </div>
  );
}