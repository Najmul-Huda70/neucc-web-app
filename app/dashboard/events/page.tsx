"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";
import EventFormModal from "@/components/dashboard/events/EventFormModal";

type EventRecord = PublicEventCardData & { eventId: string; slug: string; status: string; committeeId: string; description: string };

const eventGroups = [
  { value: "WORKSHOP", label: "Workshop", types: ["WORKSHOP"] },
  { value: "SEMINAR", label: "Seminar", types: ["SEMINAR"] },
  { value: "CONFERENCE", label: "Conference", types: ["CONFERENCE"] },
  { value: "CONTEST", label: "Contest", types: ["CONTEST"] },
  { value: "OTHERS", label: "Others", types: ["ELECTION", "OTHER"] },
];

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/events?page=1&pageSize=100");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load events.");
      setEvents(data.data?.items ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(fetchEvents, 0);
    return () => window.clearTimeout(request);
  }, [fetchEvents]);

  useEffect(() => {
    const request = window.setTimeout(async () => {
      const response = await fetch("/api/profile");
      const data = await response.json();
      setCanManage(["ADMIN", "MODERATOR"].includes(data.user?.role));
    }, 0);
    return () => window.clearTimeout(request);
  }, []);

  const displayedEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedGroup = eventGroups.find((group) => group.value === selectedType);
    return events.filter((event) => {
      const matchesQuery = !query || `${event.title} ${event.shortDescription}`.toLowerCase().includes(query);
      return matchesQuery && (!selectedGroup || selectedGroup.types.includes(event.type));
    });
  }, [events, searchQuery, selectedType]);

  const groupedEvents = useMemo(
    () => eventGroups
      .map((group) => ({ ...group, events: displayedEvents.filter((event) => group.types.includes(event.type)) }))
      .filter((group) => group.events.length > 0),
    [displayedEvents]
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-8 text-(--text-primary) sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Event management</h1></div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="group relative w-full sm:w-56 lg:w-72"><span className="sr-only">Search events</span><Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary)" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search events" className="w-full rounded-md border bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs outline-none focus:border-(--btn-primary-bg)" style={{ borderColor: "var(--btn-secondary-border)" }} /></label>
            {canManage && <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2.5 text-xs font-bold text-(--btn-primary-text)"><Plus size={16} /> New event</button>}
          </div>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSelectedType("ALL")} className={`rounded-md border px-5 py-2 text-xs font-semibold transition ${selectedType === "ALL" ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" : "bg-(--card-bg) hover:border-(--btn-primary-bg)"}`} style={{ borderColor: "var(--btn-secondary-border)" }}>All</button>
          {eventGroups.map((group) => <button key={group.value} type="button" onClick={() => setSelectedType(group.value)} className={`rounded-md border px-5 py-2 text-xs font-semibold capitalize transition ${selectedType === group.value ? "bg-(--btn-primary-bg) text-(--btn-primary-text)" : "bg-(--card-bg) hover:border-(--btn-primary-bg)"}`} style={{ borderColor: "var(--btn-secondary-border)" }}>{group.label}</button>)}
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-(--text-secondary)"><Loader2 className="h-8 w-8 animate-spin text-(--btn-primary-bg)" /> Loading events...</div> : displayedEvents.length === 0 ? <div className="rounded-2xl border border-dashed bg-(--card-bg) px-6 py-20 text-center" style={{ borderColor: "var(--btn-secondary-border)" }}><h2 className="font-bold">No events found</h2><p className="mt-2 text-sm text-(--text-secondary)">Try a different search.</p></div> : <div className="space-y-10">{groupedEvents.map((group) => <section key={group.value}><h2 className="mb-4 text-sm font-semibold text-(--text-secondary)">{group.label} ({group.events.length})</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{group.events.map((event) => <div key={event.eventId} className="relative cursor-pointer" onClick={() => router.push(`/dashboard/events/${event.slug}`)}><EventCard event={event} /><span className="pointer-events-none absolute right-4 top-4 rounded-full bg-(--card-bg)/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">{event.status}</span></div>)}</div></section>)}</div>}
        <EventFormModal key={modalOpen ? "new-open" : "new-closed"} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchEvents} />
      </div>
    </div>
  );
}
