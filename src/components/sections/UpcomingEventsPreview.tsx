import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/sections/events/EventCard';

export async function UpcomingEventsPreview() {
  const upcoming = await prisma.event.findMany({
    where: { status: 'UPCOMING' },
    orderBy: { date: 'asc' },
    take: 3,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-text-main sm:text-3xl">
          Upcoming Events
        </h2>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            detailsHref={`/events/${event.id}`}
          />
        ))}
      </div>
    </section>
  );
}
