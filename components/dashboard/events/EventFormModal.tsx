"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type EventRecord = {
  eventId: string;
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
};

type Committee = {
  committeeId: string;
  type: string;
  year: number;
  status: string;
};

type EventFormModalProps = {
  isOpen: boolean;
  event?: EventRecord | null;
  onClose: () => void;
  onSaved: () => void;
};

const eventTypes = ["WORKSHOP", "SEMINAR", "CONFERENCE", "CONTEST", "ELECTION", "OTHER"];
const eventStatuses = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function initialForm(event?: EventRecord | null) {
  return {
    title: event?.title ?? "",
    shortDescription: event?.shortDescription ?? "",
    description: event?.description ?? "",
    venue: event?.venue ?? "",
    type: event?.type ?? "WORKSHOP",
    status: event?.status ?? "DRAFT",
    start: toLocalDateTime(event?.start),
    end: toLocalDateTime(event?.end),
    committeeId: event?.committeeId ?? "",
  };
}

export default function EventFormModal({ isOpen, event, onClose, onSaved }: EventFormModalProps) {
  const [form, setForm] = useState(() => initialForm(event));
  const [step, setStep] = useState<1 | 2>(1);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState(event?.bannerUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [loadingCommittees, setLoadingCommittees] = useState(!event);
  const [error, setError] = useState<string | null>(null);
  const [markdownView, setMarkdownView] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (event) return;

    const request = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/committees");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load committees.");
        const activeCommittees = (data.data ?? []).filter((committee: Committee) => committee.status === "ACTIVE");
        setCommittees(activeCommittees);
        setForm((current) => ({ ...current, committeeId: current.committeeId || activeCommittees[0]?.committeeId || "" }));
      } catch (committeeError) {
        setError(committeeError instanceof Error ? committeeError.message : "Unable to load committees.");
      } finally {
        setLoadingCommittees(false);
      }
    }, 0);

    return () => window.clearTimeout(request);
  }, [event]);

  if (!isOpen) return null;

  const updateField = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleBannerChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setError(null);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleMarkdownFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name)) {
      setError("Please choose a Markdown file (.md or .markdown).");
      return;
    }
    setError(null);
    updateField("description", await file.text());
    setMarkdownView("write");
  };

  const goToDescription = () => {
    if (!form.title.trim() || !form.shortDescription.trim() || !form.venue.trim() || !form.start || !form.committeeId) {
      setError("Complete the required event details before continuing.");
      return;
    }
    if (form.end && new Date(form.end) <= new Date(form.start)) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const uploadBanner = async () => {
    if (!bannerFile) return event?.bannerUrl || null;
    const body = new FormData();
    body.append("file", bannerFile);
    const response = await fetch("/api/uploads", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to upload banner.");
    return data.data.url as string;
  };

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const bannerUrl = await uploadBanner();
      const payload = {
        ...form,
        bannerUrl,
        start: new Date(form.start).toISOString(),
        end: form.end ? new Date(form.end).toISOString() : null,
      };
      const response = await fetch(event ? `/api/events/${event.eventId}` : "/api/events", {
        method: event ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save event.");
      onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border bg-(--card-bg) p-5 shadow-2xl sm:p-7" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-(--text-secondary)">Step {step} of 2</p><h2 className="text-xl font-bold text-(--text-primary)">{event ? "Update event" : "Create event"}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close event form" className="rounded-xl p-2 text-(--text-secondary) transition hover:bg-(--stat-card-bg) hover:text-(--text-primary)"><X size={18} /></button>
        </div>
        <div className="mt-4 flex gap-2"><div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-(--btn-primary-bg)" : "bg-(--stat-card-bg)"}`} /><div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-(--btn-primary-bg)" : "bg-(--stat-card-bg)"}`} /></div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-700">{error}</div>}

          {step === 1 ? <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-xs font-semibold text-(--text-primary)">Event title<input required value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. CSE Innovation Summit" className="event-input" /></label>
              <label className="sm:col-span-2 text-xs font-semibold text-(--text-primary)">Short description <span className="font-normal text-(--text-secondary)">({form.shortDescription.length}/200)</span><input required maxLength={200} value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} placeholder="A concise event summary" className="event-input" /></label>
              <label className="text-xs font-semibold text-(--text-primary)">Event type<select value={form.type} onChange={(e) => updateField("type", e.target.value)} className="event-input">{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="text-xs font-semibold text-(--text-primary)">Status<select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="event-input">{eventStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="text-xs font-semibold text-(--text-primary)">Starts<input required type="datetime-local" value={form.start} onChange={(e) => updateField("start", e.target.value)} className="event-input" /></label>
              <label className="text-xs font-semibold text-(--text-primary)">Ends <span className="font-normal text-(--text-secondary)">(optional)</span><input type="datetime-local" value={form.end} onChange={(e) => updateField("end", e.target.value)} className="event-input" /></label>
              <label className="text-xs font-semibold text-(--text-primary)">Venue<input required value={form.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="Auditorium or online" className="event-input" /></label>
              <label className="text-xs font-semibold text-(--text-primary)">Active committee<select required disabled={Boolean(event) || loadingCommittees} value={form.committeeId} onChange={(e) => updateField("committeeId", e.target.value)} className="event-input"><option value="">{loadingCommittees ? "Loading committees..." : "Select committee"}</option>{committees.map((committee) => <option key={committee.committeeId} value={committee.committeeId}>{committee.type} · {committee.year}</option>)}{event && <option value={event.committeeId}>Current committee</option>}</select></label>
            </div>
            <label className="block text-xs font-semibold text-(--text-primary)">Event banner <span className="font-normal text-(--text-secondary)">(image, max 5 MB)</span><input type="file" accept="image/*" onChange={(e) => handleBannerChange(e.target.files?.[0])} className="event-input file:mr-3 file:rounded-lg file:border-0 file:bg-(--stat-card-bg) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-(--text-primary)" /></label>
            {bannerPreview ? <div className="relative h-40 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--btn-secondary-border)" }}><Image src={bannerPreview} alt="Event banner preview" fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" /><div className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2 text-[11px] font-semibold text-white">Banner preview</div></div> : <div className="flex items-center gap-3 rounded-2xl border border-dashed p-5 text-xs text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}><ImagePlus size={22} /> Upload a banner image to preview it here.</div>}
            <div className="flex justify-end border-t pt-4" style={{ borderColor: "var(--btn-secondary-border)" }}><button type="button" onClick={goToDescription} className="rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-bold text-(--btn-primary-text)">Next: description</button></div>
          </> : <>
            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--btn-secondary-border)", backgroundColor: "var(--stat-card-bg)" }}><p className="text-xs font-bold text-(--text-primary)">{form.title}</p><p className="mt-1 text-xs text-(--text-secondary)">{form.type} · {form.venue}</p></div>
            <div className="rounded-2xl border" style={{ borderColor: "var(--btn-secondary-border)" }}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-2" style={{ borderColor: "var(--btn-secondary-border)", backgroundColor: "var(--stat-card-bg)" }}>
                <div className="flex rounded-lg border p-0.5" style={{ borderColor: "var(--btn-secondary-border)" }}>
                  <button type="button" onClick={() => setMarkdownView("write")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markdownView === "write" ? "bg-(--card-bg) text-(--text-primary) shadow-sm" : "text-(--text-secondary)"}`}>Write</button>
                  <button type="button" onClick={() => setMarkdownView("preview")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markdownView === "preview" ? "bg-(--card-bg) text-(--text-primary) shadow-sm" : "text-(--text-secondary)"}`}>Preview</button>
                </div>
                {markdownView === "write" && <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold text-(--text-secondary) transition hover:bg-(--card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}>Import .md<input type="file" accept=".md,.markdown,text/markdown" onChange={(e) => handleMarkdownFile(e.target.files?.[0])} className="hidden" /></label>}
              </div>
              {markdownView === "write" ? <label className="block p-3 text-xs font-semibold text-(--text-primary)"><span className="sr-only">Markdown description</span><textarea required rows={15} value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="# Event overview\n\nWrite the full event brief in Markdown..." className="min-h-72 w-full resize-y border-0 bg-transparent p-0 text-sm leading-7 text-(--text-primary) outline-none" /></label> : <div className="event-markdown min-h-72 p-5"><ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description || "_Your Markdown preview will appear here._"}</ReactMarkdown></div>}
            </div>
            <div className="flex justify-between border-t pt-4" style={{ borderColor: "var(--btn-secondary-border)" }}><button type="button" onClick={() => { setError(null); setStep(1); }} className="rounded-xl border px-4 py-2.5 text-xs font-semibold text-(--text-primary)" style={{ borderColor: "var(--btn-secondary-border)" }}>Back</button><button disabled={loading} type="submit" className="flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-bold text-(--btn-primary-text) disabled:opacity-60">{loading && <Loader2 size={14} className="animate-spin" />}{loading ? "Creating event..." : event ? "Save changes" : "Create event"}</button></div>
          </>}
        </form>
      </div>
    </div>
  );
}
