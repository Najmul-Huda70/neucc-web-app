"use client";

import Image from "next/image";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, FileText, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EventFormModal from "@/components/dashboard/events/EventFormModal";
import EventRelationsPanel from "@/components/dashboard/events/EventRelationsPanel";

type EventDetail = {
  eventId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  venue: string;
  type: string;
  status: string;
  bannerUrl?: string | null;
  start: string;
  end?: string | null;
  committeeId: string;
  eventSponsors: Array<{ id: string; tier?: string | null; isPublic: boolean; comment?: string | null; sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null } }>;
  eventResources: Array<{ resourceId: string; type: string; title: string; url: string; status: string; startDate?: string | null; endDate?: string | null }>;
  galleries: Array<{ galleryId: string; imageUrl: string; caption?: string | null; location?: string | null; date?: string | null; isPublic: boolean }>;
};

function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)); }

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      const [eventResponse, profileResponse] = await Promise.all([fetch(`/api/events/${params.slug}`), fetch("/api/profile")]);
      const eventData = await eventResponse.json();
      const profileData = await profileResponse.json();
      if (!eventResponse.ok) throw new Error(eventData.message || "Unable to load event.");
      setEvent(eventData.data);
      setCanManage(["ADMIN", "MODERATOR"].includes(profileData.user?.role));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load event.");
    } finally { setLoading(false); }
  }, [params.slug]);

  useEffect(() => {
    const request = window.setTimeout(loadEvent, 0);
    return () => window.clearTimeout(request);
  }, [loadEvent]);

  const deleteEvent = async () => {
    if (!event || !window.confirm(`Delete “${event.title}”?`)) return;
    const response = await fetch(`/api/events/${event.eventId}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); setError(data.message || "Unable to delete event."); return; }
    router.push("/dashboard/events");
  };

  if (loading) return <div className="flex items-center justify-center gap-3 py-24 text-sm text-(--text-secondary)"><Loader2 className="animate-spin" /> Loading event...</div>;
  if (error || !event) return <div className="space-y-4"><button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-semibold text-(--text-secondary)"><ArrowLeft size={15} /> Back to events</button><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700">{error || "Event not found."}</div></div>;

  return <div className="mx-auto max-w-5xl space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><button onClick={() => router.push("/dashboard/events")} className="flex items-center gap-2 text-xs font-semibold text-(--text-secondary) transition hover:text-(--text-primary)"><ArrowLeft size={15} /> Back to Event Management</button>{canManage && <div className="flex gap-2"><button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2.5 text-xs font-bold text-(--btn-primary-text)"><Pencil size={14} /> Update event</button><button onClick={deleteEvent} aria-label="Delete event" className="rounded-xl border p-2.5 text-red-600" style={{ borderColor: "var(--btn-secondary-border)" }}><Trash2 size={16} /></button></div>}</div>
    <section className="overflow-hidden rounded-2xl border bg-(--card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}>{event.bannerUrl && <div className="relative h-56 w-full sm:h-72"><Image src={event.bannerUrl} alt={event.title} fill unoptimized sizes="(max-width: 640px) 100vw, 900px" className="object-cover" /></div>}<div className="border-b p-6 sm:p-8" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)"><span>{event.type}</span><span>•</span><span>{event.status}</span></div><h1 className="text-2xl font-black tracking-tight text-(--text-primary) sm:text-4xl">{event.title}</h1><p className="mt-3 max-w-3xl text-sm text-(--text-secondary)">{event.shortDescription}</p></div><div className="grid gap-4 border-b p-6 sm:grid-cols-2 sm:p-8" style={{ borderColor: "var(--btn-secondary-border)" }}><Info icon={<CalendarDays size={18} />} label="Starts" value={formatDate(event.start)} /><Info icon={<Clock3 size={18} />} label="Ends" value={event.end ? formatDate(event.end) : "No end time"} /><Info icon={<MapPin size={18} />} label="Venue" value={event.venue} /></div><div className="event-description-shell"><div className="event-description-heading"><div className="flex items-center gap-2"><FileText size={16} /><span>Event brief</span></div><span className="event-markdown-badge">Markdown</span></div><article className="event-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown></article></div></section>
    <EventRelationsPanel eventId={event.eventId} eventSponsors={event.eventSponsors} eventResources={event.eventResources} galleries={event.galleries} canManage={canManage} onChanged={loadEvent} />
    <EventFormModal key={`${editing}-${event.eventId}`} isOpen={editing} event={event} onClose={() => setEditing(false)} onSaved={async () => { setEditing(false); await loadEvent(); }} />
  </div>;
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex gap-3"> <span className="mt-0.5 text-(--btn-primary-bg)">{icon}</span><div><p className="text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)">{label}</p><p className="mt-1 text-sm font-semibold text-(--text-primary)">{value}</p></div></div>; }
