'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarRange, MapPin, Plus, Tag, Users, X } from 'lucide-react';

const initialEventRows = [
  {
    title: 'Algorithm Sprint 2026',
    category: 'COMPETITION',
    date: 'Nov 12, 2026',
    startTime: '10:00',
    endTime: '12:30',
    venue: 'CSE Lab 204',
    status: 'Upcoming',
    attendees: 87,
  },
  {
    title: 'Cyber Security Workshop',
    category: 'WORKSHOP',
    date: 'Oct 8, 2026',
    startTime: '15:00',
    endTime: '17:00',
    venue: 'Seminar Hall',
    status: 'Upcoming',
    attendees: 64,
  },
  {
    title: 'Product Design Meetup',
    category: 'MEETUP',
    date: 'Sep 28, 2026',
    startTime: '18:00',
    endTime: '20:00',
    venue: 'Innovation Hub',
    status: 'Planning',
    attendees: 42,
  },
];

export function EventManagement() {
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get('role') ?? 'EXECUTIVE_COMMITTEE';
  const roleLabel =
    selectedRole === 'ELECTION_COMMITTEE' ? 'Election Committee' : 'Executive Committee';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventRows, setEventRows] = useState(initialEventRows);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState('WORKSHOP');
  const [draftDate, setDraftDate] = useState('');
  const [draftStartTime, setDraftStartTime] = useState('09:00');
  const [draftEndTime, setDraftEndTime] = useState('11:00');
  const [draftVenue, setDraftVenue] = useState('');

  const handleSaveEvent = () => {
    const nextTitle = draftTitle.trim() || 'Untitled Event';
    const nextDate = draftDate || new Date().toISOString().slice(0, 10);
    const nextStartTime = draftStartTime || '09:00';
    const nextEndTime = draftEndTime || '11:00';
    const nextVenue = draftVenue.trim() || 'To be announced';

    const nextEvent = {
      title: nextTitle,
      category: draftCategory,
      date: nextDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      venue: nextVenue,
      status: 'Upcoming',
      attendees: 0,
    };

    setEventRows((current) => [nextEvent, ...current]);
    setDraftTitle('');
    setDraftCategory('WORKSHOP');
    setDraftDate('');
    setDraftStartTime('09:00');
    setDraftEndTime('11:00');
    setDraftVenue('');
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background text-text-main">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Committee tools</p>
            <h1 className="mt-2 font-heading text-3xl font-bold">Event Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {roleLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              New Event
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Upcoming events</p>
            <p className="mt-2 font-heading text-3xl font-bold">{eventRows.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Registrations</p>
            <p className="mt-2 font-heading text-3xl font-bold">198</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Pending review</p>
            <p className="mt-2 font-heading text-3xl font-bold">02</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-xl font-bold">Event list</h2>
          </div>

          <div className="divide-y divide-border">
            {eventRows.map((event) => (
              <div key={`${event.title}-${event.date}`} className="grid gap-4 px-5 py-4 md:grid-cols-[1.5fr_0.8fr_0.9fr_0.8fr_0.8fr] md:items-center">
                <div>
                  <p className="font-semibold text-text-main">{event.title}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                    <Tag className="h-4 w-4" />
                    {event.category}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <CalendarRange className="h-4 w-4" />
                  {event.date} · {event.startTime} - {event.endTime}
                </div>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin className="h-4 w-4" />
                  {event.venue}
                </div>

                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Users className="h-4 w-4" />
                  {event.attendees} users
                </div>

                <div className="flex items-center justify-end">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-bold">Create Event</h2>
              <button
                type="button"
                aria-label="Close event form"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-border p-2 text-text-muted hover:text-text-main"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="event-title" className="mb-1 block text-sm font-medium text-text-main">
                  Event title
                </label>
                <input
                  id="event-title"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  placeholder="Campus Hackfest"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="event-category" className="mb-1 block text-sm font-medium text-text-main">
                    Category
                  </label>
                  <select
                    id="event-category"
                    value={draftCategory}
                    onChange={(event) => setDraftCategory(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  >
                    <option value="WORKSHOP">Workshop</option>
                    <option value="MEETUP">Meetup</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="SEMINAR">Seminar</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="event-date" className="mb-1 block text-sm font-medium text-text-main">
                    Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={draftDate}
                    onChange={(event) => setDraftDate(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="event-start-time" className="mb-1 block text-sm font-medium text-text-main">
                    Start time
                  </label>
                  <input
                    id="event-start-time"
                    type="time"
                    value={draftStartTime}
                    onChange={(event) => setDraftStartTime(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="event-end-time" className="mb-1 block text-sm font-medium text-text-main">
                    End time
                  </label>
                  <input
                    id="event-end-time"
                    type="time"
                    value={draftEndTime}
                    onChange={(event) => setDraftEndTime(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="event-venue" className="mb-1 block text-sm font-medium text-text-main">
                  Venue
                </label>
                <input
                  id="event-venue"
                  value={draftVenue}
                  onChange={(event) => setDraftVenue(event.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                  placeholder="CSE Lab 204"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
