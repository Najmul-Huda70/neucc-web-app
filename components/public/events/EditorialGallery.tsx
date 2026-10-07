// components/public/events/EditorialGallery.tsx
"use client";

import { ChevronLeft, ChevronRight, Download, Edit2, MapPin, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

export type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
};

type EditorialGalleryProps = {
  images: SourceGalleryImage[];
  canManage?: boolean;
  onSaveImage?: (updatedData: {
    galleryId: string;
    caption: string;
    location: string;
    date: string;
    croppedImageFile?: File | null;
  }) => Promise<void>;
  onDeleteImage?: (galleryId: string) => Promise<void>;
};

function imageTitle(image: SourceGalleryImage, index: number) {
  return image.caption || `Event view ${index + 1}`;
}

// Helper to convert cropped canvas pixel area into a File object
function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Failed to get canvas context"));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas is empty"));
          resolve(new File([blob], "edited-gallery-image.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    };
    image.onerror = (error) => reject(error);
  });
}

export default function EditorialGallery({
  images,
  canManage = false,
  onSaveImage,
  onDeleteImage,
}: EditorialGalleryProps) {
  const visibleImages = images.slice(0, 6);
  const [visibleIndexes, setVisibleIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [previousIndexes, setPreviousIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [fadingCards, setFadingCards] = useState<boolean[]>(() => visibleImages.map(() => false));
  const [rotatingCard, setRotatingCard] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Edit State Management
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Form Values
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Handle Modal Open
  const handleOpenModal = (index: number) => {
    const currentImg = images[index];
    if (currentImg) {
      setEditCaption(currentImg.caption || "");
      setEditLocation(currentImg.location || "");
      setEditDate(currentImg.date ? new Date(currentImg.date).toISOString().slice(0, 10) : "");
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setSelectedIndex(index);
  };

  // Prevent closing when unsaved changes exist
  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes! Please save your changes before closing.")) {
        return;
      }
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setSelectedIndex(null);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasUnsavedChanges) return; // Disable keyboard navigation while editing with unsaved changes
      if (event.key === "Escape") handleCloseModal();
      if (event.key === "ArrowLeft")
        setSelectedIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length));
      if (event.key === "ArrowRight")
        setSelectedIndex((current) => (current === null ? null : (current + 1) % images.length));
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, selectedIndex, hasUnsavedChanges]);

  async function downloadImage(image: SourceGalleryImage, index: number) {
    const filename = `${imageTitle(image, index).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event-image"}.jpg`;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(image.imageUrl, "_blank", "noopener,noreferrer");
    }
  }

  // Image auto-rotation
  useEffect(() => {
    if (images.length <= 6 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setVisibleIndexes((current) => {
        const replacement = Array.from(
          { length: images.length },
          (_, index) => (nextImageIndex + index) % images.length
        ).find((index) => !current.includes(index));
        if (replacement === undefined) return current;

        setPreviousIndexes((previous) => {
          const next = [...previous];
          next[rotatingCard] = current[rotatingCard];
          return next;
        });
        setFadingCards((fading) => {
          const next = [...fading];
          next[rotatingCard] = true;
          return next;
        });
        window.setTimeout(() => {
          setFadingCards((fading) => {
            const next = [...fading];
            next[rotatingCard] = false;
            return next;
          });
        }, 50);
        setNextImageIndex((replacement + 1) % images.length);

        const next = [...current];
        next[rotatingCard] = replacement;
        return next;
      });
      setRotatingCard((current) => (current + 1) % Math.min(images.length, 6));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, nextImageIndex, rotatingCard]);

  // Handle Save
  const handleSave = async () => {
    if (selectedIndex === null || !images[selectedIndex]) return;
    const currentImg = images[selectedIndex];

    try {
      setIsSaving(true);
      let croppedFile: File | null = null;

      if (croppedAreaPixels) {
        croppedFile = await getCroppedImg(currentImg.imageUrl, croppedAreaPixels);
      }

      if (onSaveImage) {
        await onSaveImage({
          galleryId: currentImg.galleryId,
          caption: editCaption,
          location: editLocation,
          date: editDate,
          croppedImageFile: croppedFile,
        });
      }

      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (selectedIndex === null || !images[selectedIndex]) return;
    if (!window.confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      if (onDeleteImage) {
        await onDeleteImage(images[selectedIndex].galleryId);
      }
      setHasUnsavedChanges(false);
      setIsEditing(false);
      setSelectedIndex(null);
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (visibleImages.length === 0) return null;

  const currentModalImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section aria-labelledby="event-gallery-title" className="editorial-gallery">
      {/* Grid Display */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleImages.map((image, cardIndex) => {
          const currentImage = images[visibleIndexes[cardIndex]] || image;
          const previousImage = images[previousIndexes[cardIndex]] || currentImage;
          const isFading = fadingCards[cardIndex] ?? false;
          const title = imageTitle(currentImage, cardIndex);

          return (
            <article
              key={image.galleryId}
              className="editorial-gallery-card group relative aspect-4/3 overflow-hidden rounded-xl bg-[#ded8cd] opacity-0 shadow-[0_10px_30px_rgba(53,43,30,0.08)] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#8e6b45]"
              style={{ "--gallery-delay": `${cardIndex * 80}ms` } as CSSProperties}
              tabIndex={0}
              role="button"
              aria-label={`${title}, ${currentImage.location || "Event gallery"}`}
              onClick={() => handleOpenModal(visibleIndexes[cardIndex])}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenModal(visibleIndexes[cardIndex]);
                }
              }}
            >
              <Image
                src={previousImage.imageUrl}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-out ${
                  isFading ? "opacity-100" : "opacity-0"
                } group-hover:scale-105 group-focus-within:scale-105`}
              />
              <Image
                src={currentImage.imageUrl}
                alt={title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-out ${
                  isFading ? "opacity-0" : "opacity-100"
                } group-hover:scale-105 group-focus-within:scale-105`}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mb-3 h-px w-0 bg-white/80 transition-all duration-700 group-hover:w-12 group-focus-within:w-12" />
                <h3 className="font-serif text-2xl leading-tight">{title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80">
                  <MapPin size={13} aria-hidden="true" /> {currentImage.location || "Event gallery"}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* EDITORIAL GALLERY MODAL */}
      {selectedIndex !== null && currentModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Event image viewer"
          onClick={handleCloseModal}
        >
          <div
            className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-emerald-900/40 bg-[#0d1110] shadow-2xl sm:max-h-[calc(100vh-3rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
              {/* Title & Venue Input / Text */}
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => {
                        setEditCaption(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Title / Caption..."
                      className="w-full rounded-md border border-emerald-500/50 bg-black/60 px-2.5 py-1 text-sm font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <MapPin size={12} className="text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => {
                          setEditLocation(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Venue / Location..."
                        className="w-full rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white/90 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="truncate text-sm font-bold text-white sm:text-base">
                      {imageTitle(currentModalImage, selectedIndex)}
                    </h2>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/55">
                      <MapPin size={13} aria-hidden="true" /> {currentModalImage.location || "Event gallery"}
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons: Edit, Save, Delete & Close */}
              <div className="flex items-center gap-2 shrink-0">
                {canManage && (
                  <>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-800/40"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        <Save size={13} />
                        <span>{isSaving ? "Saving..." : "Save"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDelete}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-800/40"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close image viewer"
                  className="shrink-0 rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Image View / Crop Area */}
            <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-[#080b0a] p-3 sm:p-6">
              {isEditing ? (
                <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black">
                  <Cropper
                    image={currentModalImage.imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={(newCrop) => {
                      setCrop(newCrop);
                      setHasUnsavedChanges(true);
                    }}
                    onZoomChange={(newZoom) => {
                      setZoom(newZoom);
                      setHasUnsavedChanges(true);
                    }}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    showGrid
                    objectFit="contain"
                  />
                </div>
              ) : (
                <>
                  <Image
                    src={currentModalImage.imageUrl}
                    alt={imageTitle(currentModalImage, selectedIndex)}
                    width={1600}
                    height={1000}
                    unoptimized
                    className="max-h-[calc(100vh-14rem)] w-auto max-w-full object-contain"
                    priority
                  />

                  {/* Nav Arrows */}
                  {images.length > 1 && !hasUnsavedChanges && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)}
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white transition hover:bg-[#288c83] sm:left-5"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)}
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white transition hover:bg-[#288c83] sm:right-5"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer: Date Input & Download */}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium tracking-wide text-white/50">
                  {selectedIndex + 1} / {images.length}
                </span>

                {/* Date Input / Label */}
                {isEditing ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-black/50 px-3 py-1">
                    <span className="text-xs font-semibold text-emerald-400">Date:</span>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => {
                        setEditDate(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="bg-transparent text-xs text-white focus:outline-hidden"
                    />
                  </div>
                ) : currentModalImage.date ? (
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70">
                    Date: {new Date(currentModalImage.date).toLocaleDateString()}
                  </span>
                ) : null}
              </div>

              {/* Download Button */}
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => downloadImage(currentModalImage, selectedIndex)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-[#288c83]"
                  title="Download image"
                >
                  <Download size={15} /> Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}