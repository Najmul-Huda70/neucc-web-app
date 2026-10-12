import { Suspense } from "react";
import EventFilterBar from "@/components/public/events/EventFilterBar";
import EventGrid from "@/components/public/events/EventGrid";
import { getPublicEvents } from "@/lib/services/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | NEU Computer Club",
  description: "Explore all upcoming and past events organized by NEU Computer Club.",
};

type PageProps = {
  searchParams: Promise<{ search?: string; type?: string; status?: string }>;
};

export default async function PublicEventsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search || "";
  const selectedType = resolvedParams.type || "ALL";
  const selectedStatus = resolvedParams.status || "ALL";

  return (
    <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 space-y-8 pt-10 lg:pt-14">
      {/* Search & Filter Bar */}
      <EventFilterBar 
        initialSearch={searchQuery} 
        initialType={selectedType} 
        initialStatus={selectedStatus} 
      />

      {/* Grid with Suspense */}
      <Suspense key={`${searchQuery}-${selectedType}-${selectedStatus}`} fallback={<EventsSkeleton />}>
        <AsyncEventGrid search={searchQuery} type={selectedType} status={selectedStatus} />
      </Suspense>
    </section>
  );
}

async function AsyncEventGrid({ search, type, status }: { search: string; type: string; status: string }) {
  const { items: events } = await getPublicEvents({
    page: 1,
    pageSize: 100,
    type: type === "ALL" ? undefined : (type as any),
  });

  const now = new Date();
  const query = search.toLowerCase().trim();

  // Search ebong Status filter local array er opor apply kora hocche
  const filteredEvents = events.filter((event) => {
    // 1. Search Query Match (Title, Type, etc.)
    const titleMatch = event.title?.toLowerCase().includes(query);
    const typeMatch = event.type?.toLowerCase().includes(query);
    const matchesSearch = !query || titleMatch || typeMatch;

    // 2. Status Match (Null check সহ Safe Date Conversion)
    const startDate = event.startDate ? new Date(event.startDate) : new Date();
    const endDate = event.endDate ? new Date(event.endDate) : startDate;

    let matchesStatus = true;
    if (status === "UPCOMING") {
      matchesStatus = startDate >= now || endDate >= now;
    } else if (status === "PAST") {
      matchesStatus = endDate < now;
    }

    return matchesSearch && matchesStatus;
  });

  return <EventGrid events={filteredEvents} selectedType={type} />;
}

function EventsSkeleton() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div className="h-4 w-28 rounded bg-(--border-color)/40 animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) shadow-xs animate-pulse"
            >
              <div className="h-48 w-full bg-(--border-color)/30" />
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded bg-(--border-color)/40" />
                  <div className="h-5 w-3/4 rounded bg-(--border-color)/50" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 w-full rounded bg-(--border-color)/30" />
                    <div className="h-3.5 w-4/5 rounded bg-(--border-color)/30" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}