"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import EventFormModal from "@/components/dashboard/events/EventFormModal";
import ColumnFilterDropdown from "@/components/dashboard/users/ColumnFilterDropdown";

type EventRecord = {
  eventId: string;
  slug: string;
  title: string;
  shortDescription: string;
  venue: string;
  type: string;
  status: string;
  bannerUrl?: string | null;
  start: string;
  end?: string | null;
  committeeId: string;
  description: string;
};

type SortKey = "title" | "start" | "type" | "status";
type SortDirection = "default" | "asc" | "desc";

const statusOptions = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"].map((value) => ({ label: value, value }));
const typeOptions = ["WORKSHOP", "SEMINAR", "CONFERENCE", "CONTEST", "ELECTION", "OTHER"].map((value) => ({ label: value, value }));

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function cycleSort(current: { key: SortKey | null; direction: SortDirection }, key: SortKey) {
  if (current.key !== key) return { key, direction: "asc" as const };
  if (current.direction === "asc") return { key, direction: "desc" as const };
  return { key: null, direction: "default" as const };
}

function SortButton({ label, sort, sortKey, onClick }: { label: string; sort: { key: SortKey | null; direction: SortDirection }; sortKey: SortKey; onClick: () => void }) {
  const marker = sort.key !== sortKey || sort.direction === "default" ? "↕" : sort.direction === "asc" ? "▲" : "▼";
  return <button type="button" onClick={onClick} className="flex items-center gap-1 font-semibold transition hover:text-(--text-primary)">{label}<span className="text-[10px]">{marker}</span></button>;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: SortKey | null; direction: SortDirection }>({ key: null, direction: "default" });
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
    const filtered = events.filter((event) => {
      const matchesQuery = !query || `${event.title} ${event.shortDescription} ${event.venue}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(event.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(event.type);
      return matchesQuery && matchesStatus && matchesType;
    });

    if (!sort.key || sort.direction === "default") return filtered;
    const sortKey = sort.key;
    return [...filtered].sort((left, right) => {
      const leftValue = sortKey === "start" ? new Date(left.start).getTime() : left[sortKey];
      const rightValue = sortKey === "start" ? new Date(right.start).getTime() : right[sortKey];
      const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue));
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [events, searchQuery, sort, statusFilter, typeFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 bg-(--bg-app) px-4 py-6 text-(--text-primary) sm:px-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Event Management</h1>
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <div className="group relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-secondary) transition group-focus-within:text-(--btn-primary-bg)" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search events..." className="w-full rounded-full border bg-(--card-bg) py-2.5 pl-11 pr-4 text-sm text-(--text-primary) shadow-xs outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10" style={{ borderColor: "var(--btn-secondary-border)" }} />
          </div>
          {canManage && <button onClick={() => setModalOpen(true)} className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2.5 text-xs font-semibold text-(--btn-primary-text) shadow-xs transition hover:opacity-90 sm:w-auto"><Plus size={16} /> New event</button>}
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-700">{error}</div>}

      {loading ? <div className="flex flex-col items-center justify-center gap-3 py-20 text-(--text-secondary)"><Loader2 className="h-8 w-8 animate-spin text-(--btn-primary-bg)" /><p className="text-sm font-medium">Loading events...</p></div> : displayedEvents.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-(--card-bg) py-16 text-center shadow-xs" style={{ borderColor: "var(--btn-secondary-border)" }}><p className="text-sm font-semibold">No events found</p><p className="mt-1 max-w-sm text-xs text-(--text-secondary)">{searchQuery || statusFilter.length || typeFilter.length ? "No event matches your search or filters." : "There are currently no events available."}</p></div> : <div className="overflow-x-auto rounded-2xl border bg-(--card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}><table className="w-full min-w-[760px] table-fixed text-left text-xs"><colgroup><col className="w-[30%]" /><col className="w-[23%]" /><col className="w-[15%]" /><col className="w-[15%]" /><col className="w-[17%]" /></colgroup><thead className="border-b bg-(--stat-card-bg) text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}><tr><th className="p-3"><SortButton label="Event" sort={sort} sortKey="title" onClick={() => setSort((current) => cycleSort(current, "title"))} /></th><th className="p-3"><SortButton label="Schedule" sort={sort} sortKey="start" onClick={() => setSort((current) => cycleSort(current, "start"))} /></th><th className="p-3 text-center"><ColumnFilterDropdown label="Type" options={typeOptions} selected={typeFilter} onChange={setTypeFilter} /></th><th className="p-3 text-center"><ColumnFilterDropdown label="Status" options={statusOptions} selected={statusFilter} onChange={setStatusFilter} /></th><th className="p-3 text-right font-semibold">Venue</th></tr></thead><tbody>{displayedEvents.map((event) => <tr key={event.eventId} tabIndex={0} role="link" onClick={() => router.push(`/dashboard/events/${event.slug}`)} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === "Enter") router.push(`/dashboard/events/${event.slug}`); }} className="cursor-pointer border-b last:border-0 transition hover:bg-(--stat-card-bg) focus:bg-(--stat-card-bg) focus:outline-none" style={{ borderColor: "var(--btn-secondary-border)" }}><td className="p-3"><p className="truncate font-bold text-(--text-primary)">{event.title}</p><p className="mt-1 truncate text-[11px] text-(--text-secondary)">{event.shortDescription}</p></td><td className="p-3 text-(--text-secondary)"><p>{formatDate(event.start)}</p>{event.end && <p className="mt-1 text-[11px]">to {formatDate(event.end)}</p>}</td><td className="p-3 text-center font-medium text-(--text-secondary)">{event.type}</td><td className="p-3 text-center"><span className="inline-flex rounded-full border px-2 py-1 text-[10px] font-bold" style={{ borderColor: "var(--btn-secondary-border)", color: event.status === "PUBLISHED" ? "#047857" : "var(--text-secondary)" }}>{event.status}</span></td><td className="truncate p-3 text-right text-(--text-secondary)">{event.venue}</td></tr>)}</tbody></table></div>}

      <EventFormModal key={modalOpen ? "new-open" : "new-closed"} isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchEvents} />
    </div>
  );
}
