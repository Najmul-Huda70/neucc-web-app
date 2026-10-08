"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import EventFormModal from "@/components/dashboard/events/EventFormModal";
import EventRelationsPanel from "@/components/dashboard/events/EventRelationsPanel";
import EventHeader from "@/components/events/EventHeader";
import EventDescriptionSection from "@/components/dashboard/events/EventDescriptionSection";
import EventAtAGlance from "@/components/dashboard/events/EventAtAGlance";
import ErrorState from "@/components/ui/ErrorState";

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

  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const startFormatted = start.toLocaleDateString("en-US", opts);

  if (!endDate) return startFormatted;
  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) return startFormatted;

  return `${startFormatted} - ${end.toLocaleDateString("en-US", opts)}`;
}

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingMode, setEditingMode] = useState<EditingMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventResponse, profileResponse] = await Promise.all([
        fetch(`/api/events/${params.slug}`),
        fetch("/api/profile"),
      ]);
      const eventData = await eventResponse.json();
      const profileData = await profileResponse.json().catch(() => null);
      if (!eventResponse.ok) throw new Error(eventData.message || "Unable to load event.");
      setEvent(eventData.data);
      setCanManage(["ADMIN", "MODERATOR"].includes(profileData?.user?.role));
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

  const openDeleteConfirm = () => {
    setActionError(null);
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = useCallback(() => {
    if (!deleting) setConfirmOpen(false);
  }, [deleting]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDeleteConfirm();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmOpen, closeDeleteConfirm]);

  const deleteEvent = async () => {
    if (!event || deleting) return;
    try {
      setDeleting(true);
      setActionError(null);
      const response = await fetch(`/api/events/${event.eventId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to delete event.");
      }
      router.push("/dashboard/events");
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : "Unable to delete event.");
      setDeleting(false);
    }
  };

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm font-semibold text-(--text-secondary)">
        <Loader2 className="animate-spin text-(--btn-primary-bg)" size={18} />
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
        <ErrorState
          message={error || "Event not found."}
          onRetry={loadEvent}
        />
      </div>
    );
  }

  const formattedDate = formatEventDate(event.startDate, event.endDate);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 text-(--text-primary) sm:space-y-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/events")}
          className="flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition hover:text-(--text-primary)"
        >
          <ArrowLeft size={16} />
          <span>Back to event management</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={openDeleteConfirm}
              aria-haspopup="dialog"
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-500/20"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {actionError && !confirmOpen && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* Event overview card */}
      <section className="overflow-hidden rounded-2xl bg-(--card-bg)">
        <EventHeader
          title={event.title}
          shortDescription={event.shortDescription}
          type={event.type}
          status={event.status}
          detailBannerUrl={event.detailBannerUrl}
          startDate={event.startDate}
          endDate={event.endDate}
          vanue={event.vanue}
          committee={event.committee}
          canManage={canManage}
          onEditImage={() => setEditingMode("images")}
        />

        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            {/* Mobile: key info first; desktop: sidebar on the right */}
            <div className="order-1 lg:order-2">
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

            <div className="order-2 min-w-0 lg:order-1">
              <EventDescriptionSection
                description={event.description}
                canManage={canManage}
                onEditDescription={() => setEditingMode("description")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors & galleries management */}
      <EventRelationsPanel
        eventId={event.eventId}
        eventSponsors={event.eventSponsors}
        galleries={event.galleries}
        canManage={canManage}
        onChanged={loadEvent}
      />

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={closeDeleteConfirm}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            aria-describedby="delete-event-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-(--card-bg) p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <Trash2 size={20} />
              </span>
              <div className="min-w-0">
                <h2 id="delete-event-title" className="text-lg font-bold text-(--text-primary)">
                  Delete this event?
                </h2>
                <p id="delete-event-desc" className="mt-1.5 text-sm leading-6 text-(--text-secondary)">
                  <span className="font-semibold text-(--text-primary) break-words">“{event.title}”</span>{" "}
                  will be permanently deleted along with its sponsors and gallery. This action cannot be undone.
                </p>
              </div>
            </div>

            {actionError && (
              <div role="alert" className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                autoFocus
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--card-hover) hover:text-(--text-primary) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteEvent}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-70"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                <span>{deleting ? "Deleting…" : "Delete event"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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