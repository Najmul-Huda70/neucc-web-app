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
    () => eventGroups
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
            <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary) transition group-focus-within:text-(--btn-primary-bg)" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search events"
              className="w-full rounded-md border bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
              style={{ borderColor: "var(--btn-secondary-border)" }}
            />
          </label>
        </header>

        <div className="mb-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedType("ALL")}
            className={`rounded-md border px-5 py-2 text-xs font-semibold transition ${selectedType === "ALL" ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" : "bg-(--card-bg) hover:border-(--btn-primary-bg)"}`}
            style={{ borderColor: "var(--btn-secondary-border)" }}
          >
            All
          </button>
          {eventGroups.map((group) => (
            <button
              key={group.value}
              type="button"
              onClick={() => setSelectedType(group.value)}
              className={`rounded-md border px-5 py-2 text-xs font-semibold capitalize transition ${selectedType === group.value ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" : "bg-(--card-bg) hover:border-(--btn-primary-bg)"}`}
              style={{ borderColor: "var(--btn-secondary-border)" }}
            >
              {group.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <EventSkeleton />
        ) : displayedEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-(--card-bg) px-6 py-20 text-center" style={{ borderColor: "var(--btn-secondary-border)" }}>
            <h2 className="font-bold">No events found</h2>
            <p className="mt-2 text-sm text-(--text-secondary)">{searchQuery || selectedType !== "ALL" ? "Try a different search or event type." : "Published events will appear here soon."}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedEvents.map((group) => (
              <section key={group.value}>
                <h2 className="mb-4 text-sm font-semibold text-(--text-secondary)">{group.label} ({group.events.length})</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.events.map((event, index) => (
                    <motion.div
                      key={event.eventId}
                      initial={{ opacity: 0, y: 24, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
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