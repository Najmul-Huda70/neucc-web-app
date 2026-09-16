import { CalendarDays, MapPin } from 'lucide-react';
import type { Event } from '@/types/types';

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
      <div className="flex h-12 items-end px-5 pt-4">
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            event.status === 'UPCOMING'
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
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {event.venue}
          </div>
        </div>
      </div>
    </button>
  );
}
