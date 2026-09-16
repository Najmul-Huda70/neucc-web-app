import Link from 'next/link';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';

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
          <div
            key={event.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="p-5">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {event.category}
              </span>
              <h3 className="mt-3 font-heading font-semibold text-text-main">
                {event.title}
              </h3>
              <div className="mt-3 space-y-1 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  {event.venue}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
