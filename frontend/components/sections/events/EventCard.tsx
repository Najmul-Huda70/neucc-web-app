import Image from 'next/image';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { Event } from '@/data/types';

export function EventCard({
  event,
  onClick,
}: {
  event: Event;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            event.status === 'Upcoming'
              ? 'bg-success text-white'
              : 'bg-text-muted text-white'
          }`}
        >
          {event.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {event.category}
        </span>
        <h3 className="mt-3 font-heading font-semibold text-text-main">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
          {event.description}
        </p>
        <div className="mt-4 space-y-1 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {event.venue}
          </div>
          {event.status === 'Past' && event.participantCount !== undefined && (
            <div className="flex items-center gap-2">
              <Users size={14} />
              {event.participantCount} participants
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
