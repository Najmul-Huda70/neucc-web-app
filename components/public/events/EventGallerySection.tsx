"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Image as ImageIcon, MapPin, Calendar, X } from "lucide-react";

export type PublicEventGallery = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | Date | null;
  isHero?: boolean;
  isPublic?: boolean;
};

type Props = {
  galleries: PublicEventGallery[];
  canManage?: boolean;
  onAddGallery?: () => void;
};

export default function EventGallerySection({
  galleries = [],
  canManage = false,
  onAddGallery,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<PublicEventGallery | null>(null);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
            Event Gallery
          </h2>
          <p className="mt-0.5 text-xs text-(--text-muted)">
            Highlights and photos captured during this event.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onAddGallery}
            className="inline-flex items-center gap-1.5 rounded-md bg-(--btn-primary-bg) px-3 py-1.5 text-xs font-semibold text-(--btn-primary-text) transition hover:opacity-90 cursor-pointer"
          >
            <Plus size={14} />
            <span>Manage Gallery</span>
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      {galleries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-12 text-center">
          <ImageIcon size={32} className="mx-auto text-(--text-muted) mb-2" />
          <p className="text-xs font-semibold text-(--text-muted)">
            No photos uploaded for this event yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((item) => {
            const cardTitle = item.caption || "Event Photo";

            return (
              <div
                key={item.galleryId}
                onClick={() => setSelectedImage(item)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) shadow-xs transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                {/* 4:3 Aspect Ratio Image Box */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-black/10">
                  <Image
                    src={item.imageUrl}
                    alt={cardTitle}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Info Footer */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2">
                  <h3 className="line-clamp-1 text-xs font-bold text-(--text-primary) group-hover:text-(--btn-primary-bg) transition">
                    {cardTitle}
                  </h3>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-(--text-muted) pt-1 border-t border-(--border-color)/40">
                    {item.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.location}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {item.date && (
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Calendar size={11} className="shrink-0" />
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-(--card-bg) border border-(--border-color) shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Preview Image */}
            <div className="relative aspect-16/10 w-full max-h-[70vh] bg-black">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.caption || "Event Photo"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Lightbox Information Bar */}
            <div className="p-5 text-sm space-y-2">
              <h3 className="font-bold text-base text-(--text-primary)">
                {selectedImage.caption || "Event Photo"}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-(--text-muted) pt-1">
                {selectedImage.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-amber-500" /> {selectedImage.location}
                  </span>
                )}
                {selectedImage.date && (
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar size={13} /> {new Date(selectedImage.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}