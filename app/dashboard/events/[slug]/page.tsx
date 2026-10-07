"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Trash2, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import EventFormModal from "@/components/dashboard/events/EventFormModal";
import EventRelationsPanel from "@/components/dashboard/events/EventRelationsPanel";
import EventHeader from "@/components/events/EventHeader";
import EventDescriptionSection from "@/components/dashboard/events/EventDescriptionSection";
import EventAtAGlance from "@/components/dashboard/events/EventAtAGlance";

type EventDetail = {
  eventId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  status: string;
  detailBannerUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  vanue?: string | null;
  committeeId: string;
  committee: { type: string; year: number };
  eventSponsors: Array<{
    id: string;
    tier?: string | null;
    isPublic: boolean;
    comment?: string | null;
    sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null };
  }>;
  galleries: Array<{
    galleryId: string;
    imageUrl: string;
    caption?: string | null;
    location?: string | null;
    date?: string | null;
    isPublic: boolean;
  }>;
};

type EditingMode = "images" | "details" | "description";

function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "N/A";

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endDate) return startFormatted;
  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return startFormatted;
  }

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState<EditingMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      const [eventResponse, profileResponse] = await Promise.all([
        fetch(`/api/events/${params.slug}`),
        fetch("/api/profile"),
      ]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm font-semibold text-(--text-secondary)">
        <Loader2 className="animate-spin text-(--btn-primary-bg)" size={18} />
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-(--text-secondary) hover:text-(--text-primary)"
        >
          <ArrowLeft size={15} /> Back to events
        </button>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-medium text-red-700">
          {error || "Event not found."}
        </div>
      </div>
    );
  }

  const formattedDate = formatEventDate(event.startDate, event.endDate);

  return (
    <div className="mx-auto w-full space-y-6 text-(--text-primary)">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => router.push("/dashboard/events")}
          className="flex items-center gap-2 text-xs font-bold text-(--text-secondary) transition hover:text-(--text-primary)"
        >
          <ArrowLeft size={16} />
          <span>back to event management</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <button
              onClick={deleteEvent}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20"
              title="Delete Event"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Container Card */}
      <section>
        {/* Reused EventHeader Component */}
        <EventHeader
          title={event.title}
          type={event.type}
          detailBannerUrl={event.detailBannerUrl}
          startDate={event.startDate}
          endDate={event.endDate}
          vanue={event.vanue}
          committee={event.committee}
          canManage={canManage}
          onEditImage={() => setEditingMode("images")}
        />

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            {/* Left Column: Reused EventDescriptionSection */}
            <EventDescriptionSection
              description={event.description}
              canManage={canManage}
              onEditDescription={() => setEditingMode("description")}
            />

            {/* Right Column: Reused EventAtAGlance */}
            <EventAtAGlance
              type={event.type}
              committee={event.committee}
              status={event.status}
              formattedDate={formattedDate}
              venue={event.vanue}
              canManage={canManage}
              onEditDetails={() => setEditingMode("details")}
            />
          </div>
        </div>
      </section>

      {/* Relations Section (Sponsors & Galleries with Manage Controls) */}
      <EventRelationsPanel
        eventId={event.eventId}
        eventSponsors={event.eventSponsors}
        galleries={event.galleries}
        canManage={canManage}
        onChanged={loadEvent}
      />

      {/* Edit Modal */}
      <EventFormModal
        key={`${editingMode}-${event.eventId}`}
        isOpen={editingMode !== null}
        mode={editingMode ?? "all"}
        event={event}
        onClose={() => setEditingMode(null)}
        onSaved={async () => {
          setEditingMode(null);
          await loadEvent();
        }}
      />
    </div>
  );
}