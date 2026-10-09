"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type EventRecord = {
  eventId: string;
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  status: string;
  cardBannerUrl?: string | null;
  detailBannerUrl?: string | null;
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
  mode?: "all" | "images" | "details" | "description";
  onClose: () => void;
  onSaved: () => void;
};

const eventTypes = ["WORKSHOP", "SEMINAR", "CONFERENCE", "CONTEST", "ELECTION", "OTHER"];
const eventStatuses = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

function createCroppedFile(imageSrc: string, crop: Area, fileName: string) {
  return new Promise<File>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Unable to prepare the cropped image."));
        return;
      }
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Unable to export the cropped image."));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      }, "image/jpeg", 0.92);
    };
    image.onerror = () => reject(new Error("Unable to read the selected image."));
    image.src = imageSrc;
  });
}

function initialForm(event?: EventRecord | null) {
  return {
    title: event?.title ?? "",
    shortDescription: event?.shortDescription ?? "",
    description: event?.description ?? "",
    type: event?.type ?? "WORKSHOP",
    status: event?.status ?? "DRAFT",
    committeeId: event?.committeeId ?? "",
  };
}

export default function EventFormModal({ isOpen, event, mode = "all", onClose, onSaved }: EventFormModalProps) {
  const [form, setForm] = useState(() => initialForm(event));
  const [step, setStep] = useState<1 | 2>(() => mode === "description" ? 2 : 1);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [cardBannerFile, setCardBannerFile] = useState<File | null>(null);
  const [detailBannerFile, setDetailBannerFile] = useState<File | null>(null);
  const [cardBannerPreview, setCardBannerPreview] = useState(event?.cardBannerUrl ?? "");
  const [detailBannerPreview, setDetailBannerPreview] = useState(event?.detailBannerUrl ?? "");
  const [cropTarget, setCropTarget] = useState<"card" | "detail" | null>(null);
  const [cropSource, setCropSource] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCommittees, setLoadingCommittees] = useState(!event);
  const [error, setError] = useState<string | null>(null);
  const [markdownView, setMarkdownView] = useState<"write" | "preview">("write");
  const singleStep = mode !== "all";

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

  const handleBannerChange = (file: File | undefined, target: "card" | "detail") => {
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
    setCropTarget(target);
    setCropSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const cancelCrop = () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropTarget(null);
    setCropSource("");
    setCroppedAreaPixels(null);
  };

  const applyCrop = async () => {
    if (!cropTarget || !cropSource || !croppedAreaPixels) return;
    try {
      const file = await createCroppedFile(cropSource, croppedAreaPixels, `${cropTarget}-banner.jpg`);
      const preview = URL.createObjectURL(file);
      if (cropTarget === "card") {
        setCardBannerFile(file);
        setCardBannerPreview(preview);
      } else {
        setDetailBannerFile(file);
        setDetailBannerPreview(preview);
      }
      cancelCrop();
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop the image.");
    }
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
    if (!form.title.trim() || !form.shortDescription.trim() || !form.committeeId) {
      setError("Complete the required event details before continuing.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const uploadBanner = async (file: File | null, existingUrl?: string | null) => {
    if (!file) return existingUrl || null;
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to upload banner.");
    return data.data.url as string;
  };

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (mode !== "images" && mode !== "details" && !form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [cardBannerUrl, detailBannerUrl] = await Promise.all([
        uploadBanner(cardBannerFile, event?.cardBannerUrl),
        uploadBanner(detailBannerFile, event?.detailBannerUrl),
      ]);
      const payload = {
        ...form,
        cardBannerUrl,
        detailBannerUrl,
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
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-(--text-secondary)">{singleStep ? "Update" : `Step ${step} of 2`}</p><h2 className="text-xl font-bold text-(--text-primary)">{event ? "Update event" : "Create event"}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close event form" className="rounded-xl p-2 text-(--text-secondary) transition hover:bg-(--stat-card-bg) hover:text-(--text-primary)"><X size={18} /></button>
        </div>
        {!singleStep && <div className="mt-4 flex gap-2"><div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-(--btn-primary-bg)" : "bg-(--stat-card-bg)"}`} /><div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-(--btn-primary-bg)" : "bg-(--stat-card-bg)"}`} /></div>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-700">{error}</div>}

          {step === 1 ? <>
            <div className={`${mode === "images" ? "hidden" : ""} grid gap-4 sm:grid-cols-2`}>
              <label className="sm:col-span-2 text-xs font-semibold text-(--text-primary)">Event title<input required value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. CSE Innovation Summit" className="event-input" /></label>
              <label className="sm:col-span-2 text-xs font-semibold text-(--text-primary)">Short description <span className="font-normal text-(--text-secondary)">({form.shortDescription.length}/200)</span><input required maxLength={200} value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} placeholder="A concise event summary" className="event-input" /></label>
              <label className="text-xs font-semibold text-(--text-primary)">Event type<select value={form.type} onChange={(e) => updateField("type", e.target.value)} className="event-input">{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
              <label className="text-xs font-semibold text-(--text-primary)">Status<select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="event-input">{eventStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="text-xs font-semibold text-(--text-primary)">Active committee<select required disabled={Boolean(event) || loadingCommittees} value={form.committeeId} onChange={(e) => updateField("committeeId", e.target.value)} className="event-input"><option value="">{loadingCommittees ? "Loading committees..." : "Select committee"}</option>{committees.map((committee) => <option key={committee.committeeId} value={committee.committeeId}>{committee.type} · {committee.year}</option>)}{event && <option value={event.committeeId}>Current committee</option>}</select></label>
            </div>
            <div className={`${mode === "details" ? "hidden" : ""} grid gap-4 sm:grid-cols-2`}>
              <label className="block text-xs font-semibold text-(--text-primary)">Card banner <span className="font-normal text-(--text-secondary)">(crop to 2.2:1, max 5 MB)</span><input type="file" accept="image/*" onChange={(e) => handleBannerChange(e.target.files?.[0], "card")} className="event-input file:mr-3 file:rounded-lg file:border-0 file:bg-(--stat-card-bg) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-(--text-primary)" /></label>
              <label className="block text-xs font-semibold text-(--text-primary)">Detail banner <span className="font-normal text-(--text-secondary)">(crop to 2.2:1, max 5 MB)</span><input type="file" accept="image/*" onChange={(e) => handleBannerChange(e.target.files?.[0], "detail")} className="event-input file:mr-3 file:rounded-lg file:border-0 file:bg-(--stat-card-bg) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-(--text-primary)" /></label>
            </div>
            <div className={`${mode === "details" ? "hidden" : ""} grid gap-4 sm:grid-cols-2`}>
              {[{ label: "Card banner preview", preview: cardBannerPreview }, { label: "Detail banner preview", preview: detailBannerPreview }].map(({ label, preview }) => preview ? <div key={label} className="relative aspect-[2.2/1] overflow-hidden rounded-2xl border bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}><Image src={preview} alt={label} fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" /><div className="absolute bottom-0 left-0 right-0 bg-black/55 px-3 py-2 text-[11px] font-semibold text-white">{label}</div></div> : <div key={label} className="flex aspect-[2.2/1] items-center gap-3 rounded-2xl border border-dashed p-5 text-xs text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}><ImagePlus size={22} /> {label}</div>)}
            </div>
            <div className="flex justify-end border-t pt-4" style={{ borderColor: "var(--btn-secondary-border)" }}>{singleStep ? <button disabled={loading} type="submit" className="flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-bold text-(--btn-primary-text) disabled:opacity-60">{loading && <Loader2 size={14} className="animate-spin" />}Save changes</button> : <button type="button" onClick={goToDescription} className="rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-bold text-(--btn-primary-text)">Next: description</button>}</div>
          </> : <>
            <div className="rounded-2xl border p-4" style={{ borderColor: "var(--btn-secondary-border)", backgroundColor: "var(--stat-card-bg)" }}><p className="text-xs font-bold text-(--text-primary)">{form.title}</p><p className="mt-1 text-xs text-(--text-secondary)">{form.type}</p></div>
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
      {cropTarget && cropSource && <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-2xl rounded-2xl border bg-(--card-bg) p-5 shadow-2xl" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-bold text-(--text-primary)">{cropTarget === "card" ? "Crop card banner" : "Crop detail banner"}</h3><p className="mt-1 text-xs text-(--text-secondary)">Drag the image and adjust zoom to fit the frame.</p></div><button type="button" onClick={cancelCrop} aria-label="Close crop editor" className="rounded-xl p-2 text-(--text-secondary) hover:bg-(--stat-card-bg)"><X size={18} /></button></div>
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "2.2 / 1" }}>
            <Cropper image={cropSource} crop={crop} zoom={zoom} aspect={2.2} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)} showGrid objectFit="contain" />
          </div>
          <label className="mt-5 block text-xs font-semibold text-(--text-primary)">Zoom<input aria-label="Image zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-(--btn-primary-bg)" /></label>
          <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={cancelCrop} className="rounded-xl border px-4 py-2.5 text-xs font-semibold text-(--text-primary)" style={{ borderColor: "var(--btn-secondary-border)" }}>Cancel</button><button type="button" onClick={applyCrop} disabled={!croppedAreaPixels} className="rounded-xl bg-(--btn-primary-bg) px-4 py-2.5 text-xs font-bold text-(--btn-primary-text) disabled:opacity-50">Use cropped image</button></div>
        </div>
      </div>}
    </div>
  );
}