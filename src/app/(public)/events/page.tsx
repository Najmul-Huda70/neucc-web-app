'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event, EventCategory, EventStatus } from '@/types/types';
import { EventCard } from '@/components/sections/events/EventCard';
import { EventModal } from '@/components/sections/events/EventModal';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES: EventCategory[] = ['WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP'];
const STATUSES: EventStatus[] = ['UPCOMING', 'PAST', 'CANCELLED'];
const PAGE_SIZE = 6;

export default function EventsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>('All');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch('/api/public/events?page=1&pageSize=100')
      .then((response) => response.json())
      .then((data) => setEvents(data.events ?? []));
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
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

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateFilter(setSearch, e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => updateFilter(setStatusFilter, e.target.value as EventStatus | 'All')}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => updateFilter(setCategoryFilter, e.target.value as EventCategory | 'All')}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="mt-10"><EmptyState title={events.length === 0 ? 'No events published yet' : 'No matching events'} description={events.length === 0 ? 'Upcoming workshops, seminars, and competitions will appear here once they are added to the club records.' : 'Try changing your search or filters to find another event.'} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-main transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-main transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
