import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShareEventButton } from '@/components/sections/events/ShareEventButton';

const EVENT_IMAGES = {
  WORKSHOP: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85',
  SEMINAR: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=85',
  COMPETITION: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85',
  MEETUP: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85',
} as const;

type EventDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EventDetailsPageProps) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true, description: true } });

  return {
    title: event?.title ?? 'Event details',
    description: event?.description ?? 'Event details from NEUCC.',
  };
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) notFound();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
  }).format(event.date);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-text-main"
      >
        <ArrowLeft size={16} />
        Back to events
      </Link>

      <article className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="relative aspect-[16/7] min-h-64 bg-stat-surface">
          <Image
            src={EVENT_IMAGES[event.category]}
            alt={`${event.category.toLowerCase()} event: ${event.title}`}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {event.category[0] + event.category.slice(1).toLowerCase()}
            </span>
            <span className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium text-text-muted">
              {event.status[0] + event.status.slice(1).toLowerCase()}
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl font-heading text-3xl font-bold leading-tight text-text-main sm:text-5xl">
            {event.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={17} />
              {event.venue}
            </span>
          </div>

          <div className="mt-8 max-w-3xl border-t border-border pt-8">
            <h2 className="font-heading text-xl font-bold text-text-main">About this event</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-text-muted">
              {event.description}
            </p>
          </div>

          {event.guests && (
            <div className="mt-8 max-w-3xl border-t border-border pt-8">
              <h2 className="font-heading text-xl font-bold text-text-main">Guests and mentors</h2>
              <p className="mt-3 text-text-muted">{event.guests}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-8">
            {event.registrationLink && event.status === 'UPCOMING' && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Register now
                <ExternalLink size={15} />
              </a>
            )}
            <ShareEventButton title={event.title} description={event.description} />
          </div>
        </div>
      </article>
    </div>
  );
}