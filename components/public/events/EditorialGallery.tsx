"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, X, ImageIcon } from "lucide-react";

export type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
  isHero: boolean;
  isPublic: boolean;
  eventId?: string | null;
};

type Props = {
  images: SourceGalleryImage[];
};

export default function EditorialGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<SourceGalleryImage | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--border-color) bg-(--card-bg) p-8 text-center">
        <ImageIcon size={32} className="mx-auto text-(--text-muted) mb-2" />
        <p className="text-xs text-(--text-muted)">No gallery photos available for this event.</p>
      </div>
    );
  }

  return (
    <>
      {/* Event Gallery Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.galleryId}
            onClick={() => setSelectedImage(img)}
            className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) cursor-pointer transition hover:-translate-y-1 hover:shadow-md"
          >
            <Image
              src={img.imageUrl}
              alt={img.caption || "Event image"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            {img.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                <p className="text-xs font-semibold line-clamp-1">{img.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-(--card-bg) border border-(--border-color) shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-16/10 w-full max-h-[70vh] bg-black">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.caption || "Event photo"}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {(selectedImage.caption || selectedImage.location || selectedImage.date) && (
              <div className="p-4 text-xs space-y-1 bg-(--card-bg) border-t border-(--border-color)">
                {selectedImage.caption && (
                  <h3 className="font-bold text-sm text-(--text-primary)">{selectedImage.caption}</h3>
                )}
                <div className="flex items-center gap-4 text-(--text-muted)">
                  {selectedImage.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-amber-500" /> {selectedImage.location}
                    </span>
                  )}
                  {selectedImage.date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(selectedImage.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}