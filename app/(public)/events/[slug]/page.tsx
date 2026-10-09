import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import EventHeader from "@/components/events/EventHeader";
import EventCard from "@/components/public/events/EventCard";
import EventSponsorsSection from "@/components/dashboard/events/EventSponsorsSection";
import EventDescriptionSection from "@/components/dashboard/events/EventDescriptionSection";
import EventAtAGlance from "@/components/dashboard/events/EventAtAGlance";
import EventGallerySection from "@/components/public/events/EventGallerySection";
import { getPublicEventBySlug } from "@/lib/services/events";

type Props = {
  params: Promise<{ slug: string }>;
};

// Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found | NEU Computer Club" };
  }

  return {
    title: `${event.title} | NEU Computer Club`,
    description: event.shortDescription,
    openGraph: {
      title: event.title,
      description: event.shortDescription,
      images: event.detailBannerUrl ? [event.detailBannerUrl] : [],
    },
  };
}

function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "N/A";

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startFormatted = start.toLocaleDateString("en-US", opts);

  if (!endDate) return startFormatted;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return startFormatted;

  return `${startFormatted} - ${end.toLocaleDateString("en-US", opts)}`;
}

function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

function Section({ children, divider = true }: { children: ReactNode; divider?: boolean }) {
  return (
    <section className={`py-10 sm:py-14 ${divider ? "border-t border-(--border-color)" : ""}`}>
      {children}
    </section>
  );
}

export default async function PublicEventDetailsPage({ params }: Props) {
  const { slug } = await params;

  // Direct DB Fetch via Service Layer on Server Component
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound(); // Triggers Next.js 404 page automatically
  }

  const formattedDate = formatEventDate(event.startDate, event.endDate);
  const hasSponsors = event.eventSponsors.length > 0;
  const hasGallery = event.galleries.length > 0;
  const related = event.relatedEvents?.slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-(--bg-app) text-(--text-primary)">
      {/* 1. Banner & Header */}
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
        canManage={false}
      />

      {/* 2. Main Content & At a Glance */}
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
          <div className="order-1 lg:order-2">
            <EventAtAGlance
              type={event.type}
              committee={event.committee}
              status={event.status}
              formattedDate={formattedDate}
              venue={event.vanue}
              canManage={false}
            />
          </div>

          <div className="order-2 min-w-0 lg:order-1">
            <EventDescriptionSection
              description={event.description}
              canManage={false}
            />
          </div>
        </div>
      </Container>

      {/* 3. Event Gallery Section */}
      {hasGallery && (
        <Section>
          <Container>
            <EventGallerySection
              galleries={event.galleries}
              canManage={false}
            />
          </Container>
        </Section>
      )}

      {/* 4. Event Sponsors Section */}
      {hasSponsors && (
        <Section>
          <Container>
            <EventSponsorsSection
              sponsors={event.eventSponsors}
              canManage={false}
            />
          </Container>
        </Section>
      )}

      {/* 5. Related Events */}
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