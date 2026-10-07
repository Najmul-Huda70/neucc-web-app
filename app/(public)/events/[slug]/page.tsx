"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import EventHeader from "@/components/events/EventHeader";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";
import EventGallerySection, { PublicEventGallery } from "@/components/dashboard/events/EventGallerySection";
import EventSponsorsSection, { PublicEventSponsor } from "@/components/dashboard/events/EventSponsorsSection";
import EventDescriptionSection from "@/components/dashboard/events/EventDescriptionSection";
import EventAtAGlance from "@/components/dashboard/events/EventAtAGlance";

type PublicEventDetail = {
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  status: string;
  detailBannerUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  vanue?: string | null;
  committee: { type: string; year: number };
  eventSponsors: PublicEventSponsor[];
  galleries: PublicEventGallery[];
  relatedEvents: PublicEventCardData[];
};

type PublicEventDetailsPageProps = {
  canManage?: boolean;
  onEditModeChange?: (mode: "images" | "description" | "details" | "sponsors" | "gallery") => void;
};

// Date formatting utility function
function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "N/A";

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endDate) return startFormatted;
  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return startFormatted;
  }

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

export default function PublicEventDetailsPage({
  canManage = false,
  onEditModeChange,
}: PublicEventDetailsPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${slug}`);
        const data = await response.json();
        if (!response.ok || data.data?.status !== "PUBLISHED") throw new Error("Event not found.");
        setEvent(data.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load event.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug]);

  if (loading)
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-(--text-secondary)">
        <Loader2 className="animate-spin" /> Loading event...
      </div>
    );

  if (error || !event)
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700">
          {error || "Event not found."}
        </p>
      </div>
    );

  const formattedDate = formatEventDate(event.startDate, event.endDate);

  return (
    <div className="min-h-screen bg-[#f3f1eb] text-[#202522]">
      <motion.article
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className="overflow-hidden bg-[#fffdfa]"
      >
        {/* 1. Header Component */}
        <EventHeader
          title={event.title}
          shortDescription={event.shortDescription}
          type={event.type}
          status={event.status}
          detailBannerUrl={event.detailBannerUrl}
          committee={event.committee}
          startDate={event.startDate}
          endDate={event.endDate}
          vanue={event.vanue}
          canManage={canManage}
          onEditImage={() => onEditModeChange?.("images")}
        />

        <div className="mx-auto w-full max-w-360 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
            {/* 2. Description Component */}
            <EventDescriptionSection
              description={event.description}
              canManage={canManage}
              onEditDescription={() => onEditModeChange?.("description")}
            />

            {/* 3. At a Glance Component */}
            <EventAtAGlance
              type={event.type}
              committee={event.committee}
              formattedDate={formattedDate}
              venue={event.vanue}
              canManage={canManage}
              onEditDetails={() => onEditModeChange?.("details")}
            />
          </div>

          {/* 4. Sponsors Component */}
          <EventSponsorsSection
            sponsors={event.eventSponsors}
            canManage={canManage}
            onEditSponsors={() => onEditModeChange?.("sponsors")}
          />

          {/* 5. Gallery Component */}
          <EventGallerySection
            galleries={event.galleries}
            canManage={canManage}
          />
        </div>
      </motion.article>

      {/* Related Events Section */}
      {event.relatedEvents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-8 w-full max-w-1440px px-5 pb-16 sm:px-10 lg:px-16"
        >
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#d9d5cc] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">
                Keep exploring
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                More {event.type.toLowerCase()} events
              </h2>
            </div>
            <Link
              href={`/events?type=${event.type}`}
              className="hidden text-xs font-bold text-(--text-secondary) hover:text-(--btn-primary-bg) sm:block"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.relatedEvents.slice(0, 3).map((related, index) => (
              <motion.div
                key={related.eventId}
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <EventCard event={related} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}