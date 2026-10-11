"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import GalleryCard, { SourceGalleryImage } from "@/components/ui/card/GalleryCard";
import GalleryPreviewModal from "@/components/ui/modal/GalleryPreviewModal";
import EmptyStateCard from "@/components/ui/card/EmptyStateCard";

type Props = {
  initialImages: SourceGalleryImage[];
};

export default function GalleryClient({ initialImages }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-(--border-color)">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-(--text-primary)">
            Gallery
          </h1>
        </div>

        <label className="group relative w-full sm:w-64 lg:w-72">
          <span className="sr-only">Search gallery</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--text-primary)"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by caption, event, location..."
            className="w-full rounded-xl border border-(--input-border) bg-(--input-bg) py-2.5 pl-10 pr-4 text-xs text-(--text-primary) placeholder:text-(--text-muted) outline-none transition focus:ring-2 focus:ring-(--focus-ring)"
          />
        </label>
      </header>

      {/* Grid or Empty State */}
      {filteredImages.length === 0 ? (
        <EmptyStateCard
          title="No Images Found"
          description={
            searchQuery
              ? "No photos match your current search criteria. Try a different keyword."
              : "Gallery photos will appear here soon."
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((img, idx) => (
            <GalleryCard
              key={img.galleryId}
              image={img}
              onClick={() => setSelectedIndex(idx)} // পাস করা হচ্ছে অরিজিনাল ইনডেক্স
            />
          ))}
        </div>
      )}

      {/* Enhanced Full Lightbox Modal */}
      <GalleryPreviewModal
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        images={filteredImages}
        currentIndex={selectedIndex ?? 0}
        onIndexChange={(newIndex) => setSelectedIndex(newIndex)}
      />
    </div>
  );
}