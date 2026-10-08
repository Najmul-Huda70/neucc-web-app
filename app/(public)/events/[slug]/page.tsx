"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import EventHeader from "@/components/events/EventHeader";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";
import EventGallerySection, { PublicEventGallery } from "@/components/dashboard/events/EventGallerySection";
import EventSponsorsSection, { PublicEventSponsor } from "@/components/dashboard/events/EventSponsorsSection";
import EventDescriptionSection from "@/components/dashboard/events/EventDescriptionSection";
import EventAtAGlance from "@/components/dashboard/events/EventAtAGlance";
import EventDetailsSkeleton from "@/components/public/events/EventDetailsSkeleton";
import ErrorState from "@/components/ui/ErrorState";

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

function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "N/A";

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startFormatted = start.toLocaleDateString("en-US", opts);

  if (!endDate) return startFormatted;
  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return startFormatted;

  return `${startFormatted} - ${end.toLocaleDateString("en-US", opts)}`;
}

/**
 * Shared page container: every section uses the SAME horizontal padding & max width,
 * so left/right edges align perfectly from header content to footer.
 */
function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

/** Consistent vertical rhythm between sections. */
function Section({ children, divider = true }: { children: ReactNode; divider?: boolean }) {
  return (
    <section className={`py-10 sm:py-14 ${divider ? "border-t border-(--border-color)" : ""}`}>
      {children}
    </section>
  );
}

export default function PublicEventDetailsPage({
  canManage = false,
  onEditModeChange,
}: PublicEventDetailsPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
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
  }, [slug]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  if (loading) return <EventDetailsSkeleton />;

  if (error || !event) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-(--bg-app) px-4 py-10">
        <ErrorState
          message={error || "Event not found."}
          onRetry={loadEvent}
        />
      </main>
    );
  }

  const formattedDate = formatEventDate(event.startDate, event.endDate);
  const hasSponsors = event.eventSponsors.length > 0 || canManage;
  const hasGallery = event.galleries.length > 0 || canManage;
  const related = event.relatedEvents.slice(0, 3);

  return (
    <main className="min-h-screen bg-(--bg-app) text-(--text-primary)">
      {/* 1. Hero / Header */}
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

      {/* 2. Main content: description + sticky sidebar */}
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
          {/* Mobile: key info first, Desktop: sidebar on the right */}
          <div className="order-1 lg:order-2">
            <EventAtAGlance
              type={event.type}
              committee={event.committee}
              status={event.status}
              formattedDate={formattedDate}
              venue={event.vanue}
              canManage={canManage}
              onEditDetails={() => onEditModeChange?.("details")}
            />
          </div>

          <div className="order-2 min-w-0 lg:order-1">
            <EventDescriptionSection
              description={event.description}
              canManage={canManage}
              onEditDescription={() => onEditModeChange?.("description")}
            />
          </div>
        </div>
      </Container>

      {/* 3. Gallery */}
      {hasGallery && (
        <Section>
          <Container>
            <EventGallerySection
              galleries={event.galleries}
              canManage={canManage}
              onAddGallery={() => onEditModeChange?.("gallery")}
            />
          </Container>
        </Section>
      )}

      {/* 4. Sponsors */}
      {hasSponsors && (
        <Section>
          <Container>
            <EventSponsorsSection
              sponsors={event.eventSponsors}
              canManage={canManage}
              onEditSponsors={() => onEditModeChange?.("sponsors")}
            />
          </Container>
        </Section>
      )}

      {/* 5. Related events */}
      {related.length > 0 && (
        <section className="border-t border-(--border-color) bg-(--card-bg) py-10 sm:py-14">
          <Container>
            <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                More {event.type.toLowerCase()} events
              </h2>
              <Link
                href={`/events?type=${event.type}`}
                className="shrink-0 text-sm font-semibold text-(--text-secondary) transition hover:text-(--btn-primary-bg)"
              >
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((item) => (
                <EventCard key={item.eventId} event={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}