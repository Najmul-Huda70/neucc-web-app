import { Suspense } from "react";
import type { Metadata } from "next";
import GalleryClient from "@/components/public/gallery/GalleryClient";
import SearchInput from "@/components/ui/SearchInput";
import { getPublicGalleryImages } from "@/lib/services/gallery";

export const metadata: Metadata = {
  title: "Photo Gallery | NEU Computer Club",
  description:
    "Explore event highlights, workshop memories, and photo galleries from NEU Computer Club, Department of CSE.",
  openGraph: {
    title: "Photo Gallery | NEU Computer Club",
    description:
      "Explore event highlights, workshop memories, and photo galleries from NEU Computer Club, Department of CSE.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Gallery | NEU Computer Club",
    description:
      "Explore event highlights, workshop memories, and photo galleries from NEU Computer Club, Department of CSE.",
  },
};

type PageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function PublicGalleryPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.search || "";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 sm:px-8 space-y-8 pt-10 lg:pt-14">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header with SearchBar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-(--text-primary)">
            Gallery
          </h1>

          {/* Reusable Search Input */}
          <SearchInput
            initialValue={searchQuery}
            placeholder="Search by caption, event, location..."
            paramName="search"
            className="w-full sm:w-64 lg:w-80"
          />
        </header>

        {/* Suspense Wrapper */}
        <Suspense key={searchQuery} fallback={<GallerySkeleton />}>
          <AsyncGalleryGrid search={searchQuery} />
        </Suspense>
      </div>
    </main>
  );
}

async function AsyncGalleryGrid({ search }: { search: string }) {
  const images = await getPublicGalleryImages();
  const query = search.toLowerCase().trim();

  // Search Query filter on Server
  const filteredImages = images.filter((img) => {
    if (!query) return true;
    const captionMatch = img.caption?.toLowerCase().includes(query);
    const eventMatch = img.event?.title?.toLowerCase().includes(query);
    const locationMatch = img.location?.toLowerCase().includes(query);

    return captionMatch || eventMatch || locationMatch;
  });

  return <GalleryClient images={filteredImages} searchQuery={search} />;
}

function GallerySkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) shadow-xs animate-pulse"
        >
          {/* Top Image Banner Skeleton */}
          <div className="h-52 w-full bg-(--border-color)/30" />

          {/* Content Body */}
          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            {/* Title / Caption Placeholder */}
            <div className="h-4 w-3/5 rounded bg-(--border-color)/50" />

            {/* Card Footer: Location (Left) & Date (Right) */}
            <div className="pt-3 border-t border-(--border-color)/30 flex items-center justify-between">
              {/* Location Placeholder */}
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-full bg-(--border-color)/40" />
                <div className="h-3 w-16 rounded bg-(--border-color)/30" />
              </div>

              {/* Date Placeholder */}
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded bg-(--border-color)/40" />
                <div className="h-3 w-20 rounded bg-(--border-color)/30" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}