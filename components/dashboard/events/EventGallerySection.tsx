// components/dashboard/events/EventGallerySection.tsx
"use client";

import { Plus } from "lucide-react";
import EditorialGallery, { type SourceGalleryImage } from "@/components/public/events/EditorialGallery";

export type PublicEventGallery = SourceGalleryImage;

type EventGallerySectionProps = {
  galleries: PublicEventGallery[];
  canManage?: boolean;
  onAddGallery?: () => void;
  onSaveGallery?: (data: {
    galleryId: string;
    caption: string;
    location: string;
    date: string;
    croppedImageFile?: File | null;
  }) => Promise<void>;
  onDeleteGallery?: (galleryId: string) => Promise<void>;
};

export default function EventGallerySection({
  galleries,
  canManage = false,
  onAddGallery,
  onSaveGallery,
  onDeleteGallery,
}: EventGallerySectionProps) {
  if (galleries.length === 0 && !canManage) return null;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          Gallery
        </h2>

        {canManage && (
          <button
            type="button"
            onClick={onAddGallery}
            className="flex items-center gap-1.5 rounded-lg bg-(--btn-primary-bg) px-3 py-1.5 text-xs font-bold text-(--btn-primary-text) transition hover:opacity-90"
          >
            <Plus size={14} />
            <span>Add image</span>
          </button>
        )}
      </div>

      {galleries.length > 0 ? (
        <EditorialGallery
          images={galleries}
          canManage={canManage}
          onSaveImage={onSaveGallery}
          onDeleteImage={onDeleteGallery}
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-(--border-color) py-10 text-center text-sm text-(--text-muted)">
          No gallery images uploaded yet.
        </p>
      )}
    </div>
  );
}