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
    <div className="mt-16 border-t border-[#d9d5cc] pt-10">
      {/* Header Section (Always Visible) */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">
            {canManage ? "Gallery Management" : "Moments"}
          </p>
          <h3 className="text-lg font-bold text-(--text-primary)">Event Gallery</h3>
        </div>

        {/* Add Image Button (Admin Only) */}
        {canManage && (
          <button
            type="button"
            onClick={onAddGallery}
            className="flex items-center gap-1.5 rounded-lg bg-(--btn-primary-bg) px-3 py-1.5 text-xs font-bold text-(--btn-primary-text) transition hover:opacity-90"
          >
            <Plus size={14} />
            <span>Add Image</span>
          </button>
        )}
      </div>

      {/* Gallery Content */}
      {galleries.length > 0 ? (
        <EditorialGallery
          images={galleries}
          canManage={canManage}
          onSaveImage={onSaveGallery}
          onDeleteImage={onDeleteGallery}
        />
      ) : (
        <p className="py-8 text-center text-xs text-[#7a817b]">
          No gallery images uploaded yet.
        </p>
      )}
    </div>
  );
}