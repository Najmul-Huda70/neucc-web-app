"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import GalleryDashboardCard, { AdminGalleryImage } from "@/components/gallery/GalleryDashboardCard";
import AddGalleryModal from "@/components/gallery/AddGalleryModal";
import EditGalleryModal from "@/components/gallery/EditGalleryModal";

export default function DashboardGalleriesPage() {
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTab, setCategoryTab] = useState<"ALL" | "EVENTS" | "HERO" | "OTHERS">("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"ALL" | "PUBLIC" | "HIDE">("ALL");
  
  // Modals State
  const [selectedImage, setSelectedImage] = useState<AdminGalleryImage | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Silent Refresh Function (No blinking)
  const refreshGallery = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery");
      const json = await res.json();
      if (json.success) {
        setImages(json.data);
      }
    } catch (err) {
      console.error("Failed to refresh gallery:", err);
    }
  }, []);

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await refreshGallery();
      setLoading(false);
    }
    initialFetch();
  }, [refreshGallery]);

  // Multi-layer Filtering Logic
  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return images.filter((img) => {
      // 1. Search Query Filter
      const captionMatch = img.caption?.toLowerCase().includes(query);
      const eventMatch = img.event?.title.toLowerCase().includes(query);
      const locationMatch = img.location?.toLowerCase().includes(query);
      const matchesSearch = !query || captionMatch || eventMatch || locationMatch;

      // 2. Visibility Filter
      const matchesVisibility =
        visibilityFilter === "ALL" ||
        (visibilityFilter === "PUBLIC" && img.isPublic) ||
        (visibilityFilter === "HIDE" && !img.isPublic);

      // 3. Category Tab Filter
      const isEvents = Boolean(img.eventId);
      const isHero = img.isHero;
      const isOthers = !isHero && !isEvents;

      const matchesTab =
        categoryTab === "ALL" ||
        (categoryTab === "EVENTS" && isEvents) ||
        (categoryTab === "HERO" && isHero) ||
        (categoryTab === "OTHERS" && isOthers);

      return matchesSearch && matchesVisibility && matchesTab;
    });
  }, [images, searchQuery, categoryTab, visibilityFilter]);

  // Grouped datasets
  const eventsList = useMemo(
    () => filteredImages.filter((img) => Boolean(img.eventId)),
    [filteredImages]
  );
  const heroList = useMemo(() => filteredImages.filter((img) => img.isHero), [filteredImages]);
  const othersList = useMemo(
    () => filteredImages.filter((img) => !img.isHero && !img.eventId),
    [filteredImages]
  );

  // Smooth State Handlers + Silent Sync
  function handleCreated(newItem: AdminGalleryImage) {
    setImages((prev) => [newItem, ...prev]);
    refreshGallery(); // Sync in background for populated relations like event title
  }

  function handleUpdated(updated: AdminGalleryImage) {
    setImages((prev) =>
      prev.map((item) => (item.galleryId === updated.galleryId ? updated : item))
    );
    refreshGallery();
  }

  function handleDeleted(deletedGalleryId: string) {
    setImages((prev) => prev.filter((item) => item.galleryId !== deletedGalleryId));
    refreshGallery();
  }

  return (
    <div className="min-h-screen bg-(--bg-app) px-2 py-6 text-(--text-primary) sm:px-3 lg:px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header Section */}
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Gallery</h1>

            <div className="flex items-center gap-2">
              <label className="group relative w-full sm:w-64 lg:w-72">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--text-muted) transition group-focus-within:text-(--btn-primary-bg)"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gallery..."
                  className="w-full rounded-md border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs placeholder:text-(--text-muted) outline-none transition focus:border-(--btn-primary-bg) focus:ring-2 focus:ring-(--btn-primary-bg)/10"
                />
              </label>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1 shrink-0 rounded-md bg-(--btn-primary-bg) px-3 py-2 text-xs font-semibold text-(--btn-primary-text) transition hover:opacity-90 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Image</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {(["ALL", "EVENTS", "HERO", "OTHERS"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCategoryTab(tab)}
                  className={`rounded-md border border-(--border-color) px-3.5 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                    categoryTab === tab
                      ? "bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold"
                      : "bg-(--card-bg) text-(--text-primary) hover:bg-(--card-hover)"
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {(["ALL", "PUBLIC", "HIDE"] as const).map((vis) => (
                <button
                  key={vis}
                  onClick={() => setVisibilityFilter(vis)}
                  className={`rounded-md border border-(--border-color) px-3 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                    visibilityFilter === vis
                      ? "bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold"
                      : "bg-(--card-bg) text-(--text-primary) hover:bg-(--card-hover)"
                  }`}
                >
                  {vis.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Image Display Area */}
        {loading ? (
          <div className="flex h-72 items-center justify-center text-xs font-semibold text-(--text-muted)">
            <Loader2 className="animate-spin text-(--btn-primary-bg) mr-2" size={18} />
            Loading admin assets...
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) px-6 py-16 text-center">
            <ImageIcon size={32} className="mx-auto text-(--text-muted) mb-2" />
            <p className="text-sm font-bold">No gallery assets found</p>
          </div>
        ) : (
          <div className="space-y-10 pt-2">
            {(categoryTab === "ALL" || categoryTab === "EVENTS") && eventsList.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Events ({eventsList.length})
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {eventsList.map((img) => (
                    <GalleryDashboardCard
                      key={img.galleryId}
                      image={img}
                      aspectRatio="4/3"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </section>
            )}

            {(categoryTab === "ALL" || categoryTab === "HERO") && heroList.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Hero ({heroList.length})
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                  {heroList.map((img) => (
                    <GalleryDashboardCard
                      key={img.galleryId}
                      image={img}
                      aspectRatio="2.25/1"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </section>
            )}

            {(categoryTab === "ALL" || categoryTab === "OTHERS") && othersList.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                  Others ({othersList.length})
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {othersList.map((img) => (
                    <GalleryDashboardCard
                      key={img.galleryId}
                      image={img}
                      aspectRatio="4/3"
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddGalleryModal
          onClose={() => setIsAddModalOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedImage && (
        <EditGalleryModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}