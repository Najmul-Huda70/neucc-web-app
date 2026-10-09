import EventFilterList from "@/components/public/events/EventFilterList";
import { getPublicEvents } from "@/lib/services/events";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | NEU Computer Club",
  description: "Explore all upcoming and past events organized by NEU Computer Club.",
};

export default async function PublicEventsPage() {
  // Direct Server-side DB fetch (No API route call, No useEffect, No Loading Spinner)
  const { items: events } = await getPublicEvents({
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-10 text-(--text-primary) sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <EventFilterList initialEvents={events} />
      </div>
    </div>
  );
}