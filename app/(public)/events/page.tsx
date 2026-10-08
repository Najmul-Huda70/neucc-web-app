"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";
import EventSkeleton from "@/components/public/events/EventSkeleton";

type EventRecord = PublicEventCardData;

const eventGroups = [
  { value: "WORKSHOP", label: "Workshop", types: ["WORKSHOP"] },
  { value: "SEMINAR", label: "Seminar", types: ["SEMINAR"] },
  { value: "CONFERENCE", label: "Conference", types: ["CONFERENCE"] },
  { value: "CONTEST", label: "Contest", types: ["CONTEST"] },
  { value: "OTHERS", label: "Others", types: ["ELECTION", "OTHER"] },
];

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("/api/events?status=PUBLISHED&page=1&pageSize=100");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load events.");
        setEvents(data.data?.items ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const displayedEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedGroup = eventGroups.find((group) => group.value === selectedType);

    return events
      .filter((event) => {
        const searchableText = `${event.title} ${event.shortDescription} ${event.committee.type} ${event.committee.year}`.toLowerCase();
        return (!query || searchableText.includes(query)) && (!selectedGroup || selectedGroup.types.includes(event.type));
      })
      .sort((left, right) => left.title.localeCompare(right.title));
  }, [events, searchQuery, selectedType]);

  const groupedEvents = useMemo(
    () =>
      eventGroups
        .map((group) => ({ ...group, events: displayedEvents.filter((event) => group.types.includes(event.type)) }))
        .filter((group) => group.events.length > 0),
    [displayedEvents]
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-10 text-(--text-primary) sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Events</h1>
          <label className="group relative w-full sm:w-56 lg:w-72">
            <span className="sr-only">Search events</span>
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--btn-primary-bg)" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search events..."
              className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs placeholder:(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
            />
          </label>
        </header>

        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedType("ALL")}
            className={`rounded-md border border-(--border-color) px-5 py-2 text-xs font-semibold transition-all ${
              selectedType === "ALL" 
                ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" 
                : "bg-(--card-bg) text-(--text-primary) hover:bg-(--card-hover) hover:border-(--btn-primary-bg)"
            }`}
          >
            All
          </button>
          {eventGroups.map((group) => (
            <button
              key={group.value}
              type="button"
              onClick={() => setSelectedType(group.value)}
              className={`rounded-md border border-(--border-color) px-5 py-2 text-xs font-semibold capitalize transition-all ${
                selectedType === group.value 
                  ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" 
                  : "bg-(--card-bg) text-(--text-primary) hover:bg-(--card-hover) hover:border-(--btn-primary-bg)"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-(--text-important)">{error}</div>}

        {loading ? (
          <EventSkeleton />
        ) : displayedEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-20 text-center">
            <h2 className="font-bold">No events found</h2>
            <p className="mt-2 text-sm text-(--text-muted)">{searchQuery || selectedType !== "ALL" ? "Try a different search or event type." : "Published events will appear here soon."}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedEvents.map((group) => (
              <section key={group.value}>
                <h2 className="mb-4 text-sm font-semibold text-(--text-secondary)">
                  {group.label} ({group.events.length})
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.events.map((event, index) => (
                    <motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.05, margin: "0px 0px -50px 0px" }}
                      transition={{
                        duration: 0.35,
                        ease: [0.21, 0.47, 0.32, 0.98],
                        delay: (index % 3) * 0.05,
                      }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}