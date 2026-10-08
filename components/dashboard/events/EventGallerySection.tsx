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
    <div className="w-full transition-all duration-300 ease-in-out">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          Gallery
        </h2>

        {canManage && (
          <button
            type="button"
            onClick={onAddGallery}
            className="flex items-center gap-1.5 rounded-lg bg-(--btn-primary-bg) px-3.5 py-2 text-xs font-bold text-(--btn-primary-text) transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus size={14} className="transition-transform duration-200 group-hover:rotate-90" />
            <span>Add image</span>
          </button>
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg)/50 py-12 px-4 text-center transition-all duration-300 hover:border-(--btn-primary-bg)/50">
            <p className="text-sm font-medium text-(--text-muted)">
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
    </div>
  );
}