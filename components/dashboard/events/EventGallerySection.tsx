"use client";

import { useState } from "react";
import { Plus, X, Loader2, Star } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import EditorialGallery, { type SourceGalleryImage } from "@/components/public/events/EditorialGallery";

export type PublicEventGallery = SourceGalleryImage & {
  isHero?: boolean;
};

type EventGallerySectionProps = {
  galleries: PublicEventGallery[];
  canManage?: boolean;
  onAddGallery?: () => void;
  onSaveGallery?: (data: {
    galleryId?: string;
    caption: string;
    location: string;
    date: string;
    isHero?: boolean;
    croppedImageFile?: File | null;
  }) => Promise<void>;
  onDeleteGallery?: (galleryId: string) => Promise<void>;
};

// Fixed aspect ratio for gallery images (4:3)
const CROP_ASPECT_RATIO = 4 / 3;

function createCroppedFile(imageSrc: string, crop: Area, fileName: string) {
  return new Promise<File>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
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

export default function EventGallerySection({
  galleries,
  canManage = false,
  onSaveGallery,
  onDeleteGallery,
}: EventGallerySectionProps) {
  // Crop modal states
  const [cropSource, setCropSource] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [loading, setLoading] = useState(false);

  if (galleries.length === 0 && !canManage) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be smaller than 10MB.");
      return;
    }

    setCropSource(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const cancelCropModal = () => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource("");
    setCroppedAreaPixels(null);
    setCaption("");
    setLocation("");
    setDate("");
    setIsHero(false);
  };

  const handleSaveCroppedImage = async () => {
    if (!cropSource || !croppedAreaPixels || !onSaveGallery) return;

    try {
      setLoading(true);
      const croppedFile = await createCroppedFile(
        cropSource,
        croppedAreaPixels,
        `gallery-${Date.now()}.jpg`
      );

      await onSaveGallery({
        caption,
        location,
        date,
        isHero,
        croppedImageFile: croppedFile,
      });

      cancelCropModal();
    } catch (err) {
      console.error("Failed to crop/save gallery image:", err);
      alert(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full transition-all duration-300 ease-in-out">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          Gallery
        </h2>

        {canManage && (
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-(--btn-primary-bg) px-3.5 py-2 text-xs font-bold text-(--btn-primary-text) transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-95 shadow-xs">
            <Plus size={14} />
            <span>Add image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Main Gallery Area / Empty State */}
      <div className="transition-all duration-300 ease-out">
        {galleries.length > 0 ? (
          <EditorialGallery
            images={galleries}
            canManage={canManage}
            onSaveImage={onSaveGallery}
            onDeleteImage={onDeleteGallery}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--btn-secondary-border) bg-(--card-bg)/50 py-12 px-4 text-center transition-all duration-300 hover:border-(--btn-primary-bg)/50">
            <p className="text-sm font-medium text-(--text-secondary)">
              No gallery images uploaded yet.
            </p>
            {canManage && (
              <p className="mt-1 text-xs text-(--text-secondary)/70">
                Click "Add image" above to upload photos to this event.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Crop & Information Modal */}
      {cropSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-(--card-bg) p-5 shadow-2xl sm:p-6 space-y-4"
            style={{ borderColor: "var(--btn-secondary-border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--btn-secondary-border)" }}>
              <h3 className="text-lg font-bold text-(--text-primary)">
                Crop Gallery Image
              </h3>
              <button
                type="button"
                onClick={cancelCropModal}
                className="rounded-xl p-2 text-(--text-secondary) hover:bg-(--stat-card-bg)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cropper Frame */}
            <div className="relative mx-auto w-full aspect-[4/3] overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                aspect={CROP_ASPECT_RATIO}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                showGrid
                objectFit="contain"
              />
            </div>

            {/* Zoom Control */}
            <label className="block text-xs font-semibold text-(--text-primary)">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-2 w-full accent-(--btn-primary-bg)"
              />
            </label>

            {/* Image Details Inputs */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-(--text-primary) sm:col-span-2">
                Caption
                <input
                  type="text"
                  placeholder="e.g. Workshop group photo"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) px-3 py-2 text-xs text-(--text-primary) outline-none focus:ring-1 focus:ring-(--btn-primary-bg)"
                />
              </label>
              <label className="text-xs font-semibold text-(--text-primary)">
                Location
                <input
                  type="text"
                  placeholder="e.g. Lab 302"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) px-3 py-2 text-xs text-(--text-primary) outline-none focus:ring-1 focus:ring-(--btn-primary-bg)"
                />
              </label>
              <label className="text-xs font-semibold text-(--text-primary)">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-(--btn-secondary-border) bg-(--bg-app) px-3 py-2 text-xs text-(--text-primary) outline-none focus:ring-1 focus:ring-(--btn-primary-bg)"
                />
              </label>

              {/* Featured in Homepage Hero Section Option */}
              <div className="sm:col-span-2 pt-2 border-t border-(--btn-secondary-border)">
                <label className="flex items-center gap-2 text-xs font-semibold text-(--text-primary) cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isHero}
                    onChange={(e) => setIsHero(e.target.checked)}
                    className="h-4 w-4 rounded border-(--btn-secondary-border) text-(--btn-primary-bg) focus:ring-0 accent-(--btn-primary-bg) cursor-pointer"
                  />
                  <Star size={14} className={isHero ? "fill-amber-400 text-amber-500" : "text-(--text-secondary)"} />
                  <span>Feature in Homepage Hero Slider / Banner</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--btn-secondary-border)" }}>
              <button
                type="button"
                onClick={cancelCropModal}
                className="rounded-xl border border-(--btn-secondary-border) px-4 py-2.5 text-xs font-semibold text-(--text-primary)"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCroppedImage}
                disabled={loading || !croppedAreaPixels}
                className="flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-bold text-(--btn-primary-text) disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}