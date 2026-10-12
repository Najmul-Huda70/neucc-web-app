import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublicCommittees } from "@/lib/services/committees";
import CommitteeClientPage from "@/components/public/committees/CommitteeClientPage";

export const metadata: Metadata = {
  title: "Executive & Advisory Committees | NEU Computer Club",
  description:
    "Meet the executive panel, election committee, and advisory board members of NEU Computer Club, Department of CSE, North East University Bangladesh.",
  openGraph: {
    title: "Executive & Advisory Committees | NEU Computer Club",
    description:
      "Meet the executive panel, election committee, and advisory board members of NEU Computer Club.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Executive & Advisory Committees | NEU Computer Club",
    description:
      "Meet the executive panel, election committee, and advisory board members of NEU Computer Club.",
  },
};

type PageProps = {
  searchParams: Promise<{ type?: string; year?: string }>;
};

export default async function CommitteesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const selectedType = resolvedParams.type || "EXECUTIVE";
  const selectedYear = resolvedParams.year || "";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 sm:px-8 space-y-8 pt-10 lg:pt-14">
      <Suspense key={`${selectedType}-${selectedYear}`} fallback={<CommitteeSkeleton />}>
        <AsyncCommitteeContent />
      </Suspense>
    </main>
  );
}

// Direct DB Query on Server Component
async function AsyncCommitteeContent() {
  const committees = await getPublicCommittees();

  return <CommitteeClientPage initialCommittees={committees} />;
}

// Wireframe Layout matching Loading Skeleton
function CommitteeSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="h-9 w-40 rounded-xl bg-(--border-color)/40" />
        <div className="h-9 w-48 rounded-xl bg-(--border-color)/30" />
      </div>

      {/* Year Filter Navigation Skeleton */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 rounded-lg bg-(--border-color)/30" />
        ))}
      </div>

      {/* Wireframe Grid Skeleton */}
      <div className="space-y-6 pt-4">
        {/* First Row: Top 2 Leadership Skeleton Cards */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 w-full rounded-2xl border border-(--border-color) bg-(--card-bg)"
            />
          ))}
        </div>

        {/* Sub-sequent Rows: 3 Columns Grid Skeletons */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 w-full rounded-2xl border border-(--border-color) bg-(--card-bg)"
            />
          ))}
        </div>
      </div>
    </div>
  );
}