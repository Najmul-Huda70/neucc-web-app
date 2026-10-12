"use client";

import { useState } from "react";
import GalleryCard, { SourceGalleryImage } from "@/components/ui/card/GalleryCard";
import GalleryPreviewModal from "@/components/ui/modal/GalleryPreviewModal";
import EmptyStateCard from "@/components/ui/card/EmptyStateCard";

type Props = {
  images: SourceGalleryImage[];
  searchQuery?: string;
};

export default function GalleryClient({ images, searchQuery = "" }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <EmptyStateCard
        title="No Images Found"
        description={
          searchQuery
            ? "No photos match your current search criteria. Try a different keyword."
            : "Gallery photos will appear here soon."
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, idx) => (
          <GalleryCard
            key={img.galleryId}
            image={img}
            onClick={() => setSelectedIndex(idx)}
          />
        ))}
      </div>

      {/* Enhanced Full Lightbox Modal */}
      <GalleryPreviewModal
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        images={images}
        currentIndex={selectedIndex ?? 0}
        onIndexChange={(newIndex) => setSelectedIndex(newIndex)}
      />
    </div>
  );
}