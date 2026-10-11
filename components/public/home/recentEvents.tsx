import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventCard, PublicEventCardData } from "@/components/ui/card";

interface RecentEventsProps {
  events: PublicEventCardData[];
}

export default function RecentEvents({ events }: RecentEventsProps) {
  // Latest 6 events filter
  const latestEvents = events.slice(0, 6);

  if (!latestEvents || latestEvents.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-(--bg-app)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
            Recent & Upcoming Events
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-(--text-muted) font-medium">
            Explore our latest workshops, tech talks, and club activities
          </p>
        </div>

        {/* Events Grid: Responsive (1 col mobile, 2 cols tablet, 3 cols desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestEvents.map((event) => (
            <EventCard key={event.eventId} event={event as PublicEventCardData} />
          ))}
        </div>

        {/* View All Events Button */}
        <div className="flex justify-center pt-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-sm shadow-sm hover:opacity-90 transition-all"
          >
            <span>View All Events</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}