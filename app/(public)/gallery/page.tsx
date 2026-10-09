import type { Metadata } from "next";
import GalleryClient from "@/components/public/gallery/GalleryClient";
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

export default async function PublicGalleryPage() {
  // Direct DB Query on Server
  const images = await getPublicGalleryImages();

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <GalleryClient initialImages={images} />
      </div>
    </main>
  );
}