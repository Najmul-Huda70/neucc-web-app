"use client";

import { motion } from "framer-motion";
import { EventCard, PublicEventCardData } from "@/components/ui/card";

const eventGroups = [
  { value: "WORKSHOP", label: "Workshop", types: ["WORKSHOP"] },
  { value: "SEMINAR", label: "Seminar", types: ["SEMINAR"] },
  { value: "CONFERENCE", label: "Conference", types: ["CONFERENCE"] },
  { value: "CONTEST", label: "Contest", types: ["CONTEST"] },
  { value: "OTHER", label: "Others", types: ["ELECTION", "OTHER"] },
];

type EventGridProps = {
  events: PublicEventCardData[];
  selectedType?: string;
};

export default function EventGrid({ events, selectedType = "ALL" }: EventGridProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-20 text-center">
        <h2 className="font-bold">No events found</h2>
        <p className="mt-2 text-sm text-(--text-muted)">
          Try a different search or event type.
        </p>
      </div>
    );
  }

  // Event group array to filter and display counts
  const groupedEvents = eventGroups
    .map((group) => ({
      ...group,
      events: events.filter((e) => group.types.includes(e.type)),
    }))
    .filter((group) => group.events.length > 0);

  return (
    <div className="space-y-12">
      {groupedEvents.map((group) => (
        <section key={group.value}>
          {/* Header e Title ebong Count (3) dekhanor jonno */}
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
  );
}