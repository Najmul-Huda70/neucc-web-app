"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";
import GalleryGridItem from "@/components/gallery/GalleryGridItem";

export type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
  isHero: boolean;
  isPublic: boolean;
  event?: {
    title: string;
    slug: string;
  } | null;
};

export default function GalleryPage() {
  const [images, setImages] = useState<SourceGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<SourceGalleryImage | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const res = await fetch("/api/gallery");
        const json = await res.json();
        if (json.success) {
          setImages(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  // Search filter logic
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const query = searchQuery.toLowerCase();

    return images.filter((img) => {
      const captionMatch = img.caption?.toLowerCase().includes(query);
      const eventMatch = img.event?.title.toLowerCase().includes(query);
      const locationMatch = img.location?.toLowerCase().includes(query);

      return captionMatch || eventMatch || locationMatch;
    });
  }, [images, searchQuery]);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-10 text-(--text-primary) sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        
        {/* Header with Matching Search Box Structure */}
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Gallery</h1>
          <label className="group relative w-full sm:w-56 lg:w-72">
            <span className="sr-only">Search gallery</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--btn-primary-bg)"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gallery..."
              className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2.5 pl-10 pr-4 text-xs placeholder:text-(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-4 focus:ring-(--btn-primary-bg)/10"
            />
          </label>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex h-72 items-center justify-center text-xs font-semibold text-(--text-muted)">
            <Loader2 className="animate-spin text-(--btn-primary-bg) mr-2" size={18} />
            Loading gallery...
          </div>
        ) : filteredImages.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-20 text-center">
            <ImageIcon size={36} className="mx-auto text-(--text-muted) mb-3" />
            <h2 className="font-bold">No images found</h2>
            <p className="mt-2 text-xs text-(--text-muted)">
              {searchQuery ? "Try a different search query." : "Published gallery photos will appear here soon."}
            </p>
          </div>
        ) : (
          /* 3-Column Grid Cards Layout */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredImages.map((img, index) => {
              const cardTitle = img.caption || img.event?.title || "Gallery Item";

              return (
                <GalleryGridItem
                  key={img.galleryId}
                  image={img}
                  previousImage={img}
                  isFading={false}
                  cardIndex={index}
                  title={cardTitle}
                  canManage={false}
                  onClick={() => setSelectedImage(img)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}