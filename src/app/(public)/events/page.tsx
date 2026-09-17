'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Event, EventCategory, EventStatus } from '@/types/types';
import { EventCard } from '@/components/sections/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardGridLoading } from '@/components/ui/LoadingState';

const CATEGORIES: EventCategory[] = ['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP'];

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>('All');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/events?page=1&pageSize=50')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load events');
        return response.json();
      })
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        search.trim() === '' ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, search, categoryFilter, statusFilter]);

  const updateFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Events
        </h1>
        <p className="mt-3 text-text-muted">
          Workshops, seminars, competitions, and meetups — all in one place.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-stat-surface/70 p-4 sm:p-5">
        <div className="relative w-full">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateFilter(setSearch, e.target.value)}
            placeholder="Search events by title, venue or topic"
            className="h-11 w-full rounded-lg border border-border bg-surface pl-11 pr-4 text-sm text-text-main shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by category">
            {(['All', ...CATEGORIES] as const).map((category) => {
              const isActive = categoryFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateFilter(setCategoryFilter, category)}
                  className={`h-9 rounded-lg border px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-border bg-surface text-text-main hover:border-primary/50 hover:bg-background'
                  }`}
                >
                  {category === 'All' ? 'All' : category[0] + category.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0" aria-label="Filter by status">
            {(['All', 'UPCOMING', 'PAST'] as const).map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => updateFilter(setStatusFilter, status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface text-text-main shadow-sm ring-1 ring-border'
                      : 'text-text-muted hover:bg-surface hover:text-text-main'
                  }`}
                >
                  {status === 'UPCOMING' ? 'Upcoming' : status === 'PAST' ? 'Past' : 'All'}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-text-muted">
          {isLoading ? 'Loading events...' : `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'} found`}
        </p>
        {(search || categoryFilter !== 'All' || statusFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategoryFilter('All');
              setStatusFilter('All');
            }}
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-8"><CardGridLoading /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-10"><EmptyState title={events.length === 0 ? 'No events published yet' : 'No matching events'} description={events.length === 0 ? 'Upcoming workshops, seminars, and competitions will appear here once they are added to the club records.' : 'Try changing your search or filters to find another event.'} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} detailsHref={`/events/${event.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
