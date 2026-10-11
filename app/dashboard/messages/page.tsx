import { Suspense } from "react";
import { Metadata } from "next";
import { getAllMessages } from "@/lib/services/messages";
import MessagesClient from "@/components/dashboard/messages/MessagesClient";

// Page Metadata for Dashboard SEO & Title
export const metadata: Metadata = {
  title: "Messages Management | Dashboard - NEUCC",
  description: "Manage chairperson remarks and advisor messages for Netrokona University Computer Club.",
};

// Force dynamic server rendering to ensure fresh data fetch on navigation
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Loading Skeleton Component for Suspense Fallback
function MessagesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-(--stat-card-bg) rounded-lg" />
          <div className="h-4 w-80 bg-(--stat-card-bg) rounded-md" />
        </div>
        <div className="h-10 w-36 bg-(--stat-card-bg) rounded-xl" />
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Chairman Skeleton */}
        <div className="w-full max-w-2xl h-64 rounded-2xl bg-(--stat-card-bg) border border-(--btn-secondary-border)" />

        {/* Advisors Skeleton Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-(--stat-card-bg) border border-(--btn-secondary-border)"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Server Component Wrapper for Data Fetching
async function MessagesContent() {
  const initialMessages = await getAllMessages();
  return <MessagesClient initialMessages={initialMessages} />;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}