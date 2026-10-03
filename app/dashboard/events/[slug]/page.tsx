"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, FileText, ImagePlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EventFormModal from "@/components/dashboard/events/EventFormModal";
import EventRelationsPanel from "@/components/dashboard/events/EventRelationsPanel";
import EventDetailsPreviewModal from "@/components/dashboard/events/EventDetailsPreviewModal";

type EventDetail = {
  eventId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  status: string;
  detailBannerUrl?: string | null;
  committeeId: string;
  committee: { type: string; year: number };
  eventSponsors: Array<{ id: string; tier?: string | null; isPublic: boolean; comment?: string | null; sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null } }>;
  galleries: Array<{ galleryId: string; imageUrl: string; caption?: string | null; location?: string | null; date?: string | null; isPublic: boolean }>;
};

type EditingMode = "images" | "details" | "description";

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState<EditingMode | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
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
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    const request = window.setTimeout(loadEvent, 0);
    return () => window.clearTimeout(request);
  }, [loadEvent]);

  const deleteEvent = async () => {
    if (!event || !window.confirm(`Delete “${event.title}”?`)) return;
    const response = await fetch(`/api/events/${event.eventId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete event.");
      return;
    }
    router.push("/dashboard/events");
  };

  if (loading) return <div className="flex items-center justify-center gap-3 py-24 text-sm text-(--text-secondary)"><Loader2 className="animate-spin" /> Loading event...</div>;
  if (error || !event) return <div className="mx-auto max-w-5xl space-y-4"><button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-semibold text-(--text-secondary)"><ArrowLeft size={15} /> Back to events</button><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700">{error || "Event not found."}</div></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 text-(--text-primary) sm:px-6 lg:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.push("/dashboard/events")} className="flex items-center gap-2 text-sm font-bold text-(--text-secondary) transition hover:text-(--text-primary)"><ArrowLeft size={17} /> Back to Event Management</button>
        <div className="flex flex-wrap gap-2">
         <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}>Preview</button>
          {canManage && <button onClick={deleteEvent} aria-label="Delete event" className="rounded-lg border p-2 text-red-600 hover:bg-red-500/10" style={{ borderColor: "var(--btn-secondary-border)" }}><Trash2 size={16} /></button>}
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-(--card-bg)">
        <div className="relative aspect-[3.33/1] w-full bg-(--stat-card-bg)">
          {event.detailBannerUrl ? <Image src={event.detailBannerUrl} alt={event.title} fill unoptimized sizes="(max-width: 640px) 100vw, 1024px" className="object-cover" priority /> : <div className="flex h-full items-center justify-center text-sm text-(--text-secondary)">No detail banner</div>}
          {canManage && <button type="button" onClick={() => setEditingMode("images")} aria-label="Edit event images" className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-(--card-bg)/90 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur transition hover:bg-(--card-bg)"><ImagePlus size={14} /> Edit image</button>}
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-(--btn-primary-bg)"><span>{event.type}</span><span className="text-(--text-secondary)">•</span><span className="text-(--text-secondary)">{event.committee.type} Committee - {event.committee.year}</span><span className="rounded-full bg-(--stat-card-bg) px-2 py-1 text-[10px] tracking-wider text-(--text-secondary)">{event.status}</span></div>
          <div className="mt-3 flex items-start justify-between gap-4"><h1 className="text-3xl font-black tracking-tight sm:text-5xl">{event.title}</h1>{canManage && <button type="button" onClick={() => setEditingMode("details")} aria-label="Edit event details" className="shrink-0 rounded-lg border p-2 text-(--text-secondary) hover:bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}><Pencil size={16} /></button>}</div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--text-secondary) sm:text-base">{event.shortDescription}</p>
        </div>

        <div className="border-t px-6 py-7 sm:px-8" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-black"><FileText size={16} className="text-(--btn-primary-bg)" /> Description</div><div className="flex gap-2"><button type="button" onClick={() => setEditingMode("description")} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-(--text-secondary) hover:bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}>Edit</button></div></div>
          <article className="event-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown></article>
        </div>
      </section>

      <EventRelationsPanel eventId={event.eventId} eventSponsors={event.eventSponsors} galleries={event.galleries} canManage={canManage} onChanged={loadEvent} />
      <EventFormModal key={`${editingMode}-${event.eventId}`} isOpen={editingMode !== null} mode={editingMode ?? "all"} event={event} onClose={() => setEditingMode(null)} onSaved={async () => { setEditingMode(null); await loadEvent(); }} />
      {previewOpen && <EventDetailsPreviewModal slug={event.slug} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
