"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Image as ImageIcon, MapPin, Calendar, X, ExternalLink } from "lucide-react";

export type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | Date | null;
  isHero: boolean;
  isPublic: boolean;
  eventId?: string | null;
  event?: {
    title: string;
    slug: string;
  } | null;
};

type Props = {
  initialImages: SourceGalleryImage[];
};

export default function GalleryClient({ initialImages }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<SourceGalleryImage | null>(null);

  // Search Filter Logic
  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return initialImages;

    return initialImages.filter((img) => {
      const captionMatch = img.caption?.toLowerCase().includes(query);
      const eventMatch = img.event?.title.toLowerCase().includes(query);
      const locationMatch = img.location?.toLowerCase().includes(query);

      return captionMatch || eventMatch || locationMatch;
    });
  }, [initialImages, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Gallery</h1>
        </div>

        {/* Search Input */}
        <label className="group relative w-full sm:w-64 lg:w-72">
          <span className="sr-only">Search gallery</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--btn-primary-bg)"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by caption, event, location..."
            className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs placeholder:text-(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
          />
        </label>
      </header>

      {/* Empty State */}
      {filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-20 text-center">
          <ImageIcon size={36} className="mx-auto text-(--text-muted) mb-3" />
          <h2 className="font-bold text-sm">No images found</h2>
          <p className="mt-1 text-xs text-(--text-muted)">
            {searchQuery ? "Try searching with a different keyword." : "Gallery photos will appear here soon."}
          </p>
        </div>
      ) : (
        /* Gallery Grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((img) => {
            const cardTitle = img.caption || img.event?.title || "Club Photo";

            return (
              <div
                key={img.galleryId}
                onClick={() => setSelectedImage(img)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-black/10">
                  <Image
                    src={img.imageUrl}
                    alt={cardTitle}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Event Tag Overlay */}
                  {img.event && (
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-semibold text-white">
                      {img.event.title}
                    </span>
                  )}
                </div>

                {/* Card Details */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2">
                  <h3 className="line-clamp-2 text-xs font-bold text-(--text-primary) group-hover:text-(--btn-primary-bg) transition">
                    {cardTitle}
                  </h3>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-(--text-muted) pt-1 border-t border-(--border-color)/50">
                    {img.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{img.location}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {img.date && (
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={12} className="shrink-0" />
                        {new Date(img.date).toLocaleDateString()}
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
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Image Preview */}
            <div className="relative aspect-16/10 w-full max-h-[70vh] bg-black">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.caption || selectedImage.event?.title || "Gallery photo"}
                fill
                className="object-contain"
              />
            </div>

            {/* Footer Metadata */}
            <div className="p-5 text-sm space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-base">
                  {selectedImage.caption || selectedImage.event?.title || "Gallery Photo"}
                </h3>

                {selectedImage.event && (
                  <Link
                    href={`/events/${selectedImage.event.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--btn-primary-bg) hover:underline"
                  >
                    <span>View Associated Event</span>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-(--text-muted) pt-1">
                {selectedImage.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-amber-500" /> {selectedImage.location}
                  </span>
                )}
                {selectedImage.date && (
                  <span className="flex items-center gap-1">
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