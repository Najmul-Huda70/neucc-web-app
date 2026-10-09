"use client";

import { useState, useEffect, useRef, ChangeEvent, useCallback } from "react";
import Image from "next/image";
import { X, Loader2, Trash2, Upload, Crop, Check, ZoomIn } from "lucide-react";
import Cropper, { Point, Area } from "react-easy-crop";
import type { AdminGalleryImage } from "./GalleryDashboardCard";

type EventOption = {
  eventId: string;
  title: string;
};

type Props = {
  image: AdminGalleryImage;
  onClose: () => void;
  onUpdated: (updated: AdminGalleryImage) => void;
  onDeleted: (galleryId: string) => void;
};

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.src = imageSrc;
  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context found");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function EditGalleryModal({ image, onClose, onUpdated, onDeleted }: Props) {
  const [caption, setCaption] = useState(image.caption || "");
  const [location, setLocation] = useState(image.location || "");
  const [date, setDate] = useState(
    image.date ? new Date(image.date).toISOString().split("T")[0] : ""
  );
  const [isHero, setIsHero] = useState(image.isHero);
  const [isPublic, setIsPublic] = useState(image.isPublic);
  const [selectedEventId, setSelectedEventId] = useState<string>(image.eventId || "");

  const [currentImageUrl, setCurrentImageUrl] = useState(image.imageUrl);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);

  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspect = isHero ? 2.25 / 1 : 4 / 3;

  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const res = await fetch("/api/events?pageSize=100");
        const json = await res.json();
        if (json.success || json.data?.items) {
          setEvents(json.data?.items || json.data || []);
        }
      } catch (err) {
        console.error("Failed to load events list:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setCurrentImageUrl(tempUrl);
      setCroppedImageUrl(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsCropMode(true);
    }
  }

  async function handleApplyCrop() {
    if (!currentImageUrl || !croppedAreaPixels) return;
    try {
      const croppedResult = await getCroppedImg(currentImageUrl, croppedAreaPixels);
      setCroppedImageUrl(croppedResult);
      setIsCropMode(false);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const finalImageUrl = croppedImageUrl || currentImageUrl;

      const res = await fetch(`/api/gallery/${image.galleryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          location,
          date: date || null,
          isHero,
          isPublic,
          eventId: selectedEventId || null,
          imageUrl: finalImageUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onUpdated(json.data);
        onClose();
      } else {
        alert(json.message || "Failed to update image.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating gallery image.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this image from gallery?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/gallery/${image.galleryId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (json.success) {
        onDeleted(image.galleryId);
        onClose();
      } else {
        alert(json.message || "Failed to delete image.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting gallery image.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-(--card-bg) border border-(--border-color) p-6 shadow-2xl text-(--text-primary)">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Edit Gallery Asset</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {isCropMode ? (
          <div className="space-y-4 mb-4">
            <div className="relative w-full h-[320px] bg-black rounded-xl overflow-hidden shadow-inner">
              <Cropper
                image={currentImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
              />
            </div>

            <div className="space-y-1 px-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <ZoomIn size={14} className="text-(--text-muted)" /> Zoom
                </span>
                <span className="text-[11px] text-(--text-muted) font-mono">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCropMode(false)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-(--border-color) hover:bg-(--card-hover) cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
              >
                <Check size={14} /> Done Cropping ({isHero ? "2.25:1" : "4:3"})
              </button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg mb-4 bg-black/20 group">
            <Image
              src={croppedImageUrl || currentImageUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md bg-white/90 text-black px-3 py-1.5 text-xs font-semibold hover:bg-white cursor-pointer shadow-md"
              >
                <Upload size={13} /> Change File
              </button>

              <button
                type="button"
                onClick={() => setIsCropMode(true)}
                className="flex items-center gap-1.5 rounded-md bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-600 cursor-pointer shadow-md"
              >
                <Crop size={13} /> Adjust Crop & Zoom
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption..."
              className="w-full rounded-md border border-(--border-color) bg-(--bg-app) p-2 text-xs outline-none focus:border-(--btn-primary-bg)"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Associate with Event {loadingEvents && "(Loading...)"}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-md border border-(--border-color) bg-(--bg-app) p-2 text-xs outline-none focus:border-(--btn-primary-bg)"
            >
              <option value="">None (Others)</option>
              {events.map((evt) => (
                <option key={evt.eventId} value={evt.eventId}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border border-(--border-color) bg-(--bg-app) p-2 text-xs outline-none focus:border-(--btn-primary-bg)"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-(--border-color) bg-(--bg-app) p-2 text-xs outline-none focus:border-(--btn-primary-bg)"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isHero}
                onChange={(e) => {
                  setIsHero(e.target.checked);
                  setIsCropMode(true);
                }}
                className="accent-amber-500"
              />
              Hero Image (2.25:1 Ratio)
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="accent-emerald-500"
              />
              Public Visibility
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-(--border-color) pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Delete Image
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-(--border-color) text-xs font-semibold hover:bg-(--card-hover) cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 rounded-md bg-(--btn-primary-bg) text-(--btn-primary-text) text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}