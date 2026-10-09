"use client";

import Image from "next/image";
import { MapPin, Eye, EyeOff, Calendar } from "lucide-react";

export type AdminGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
  isHero: boolean;
  isPublic: boolean;
  eventId?: string | null;
  event?: {
    title: string;
    slug: string;
  } | null;
};

type Props = {
  image: AdminGalleryImage;
  aspectRatio: "4/3" | "2.25/1";
  onClick: () => void;
};

export default function GalleryDashboardCard({ image, aspectRatio, onClick }: Props) {
  const aspectClass = aspectRatio === "2.25/1" ? "aspect-[2.25/1]" : "aspect-[4/3]";
  const title = image.caption || image.event?.title || "Untitled Image";

  return (
    <article
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-(--card-bg) border border-(--border-color) cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-(--btn-primary-bg)"
    >
      {/* Top Image Box with Fixed Aspect Ratio */}
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-black/10`}>
        <Image
          src={image.imageUrl}
          alt={title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Left Event Badge */}
        {image.event && (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-md bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
            {image.event.title}
          </span>
        )}

        {/* Top Right Visibility Badges */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {image.isPublic ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Eye size={10} /> Public
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-200 shadow-xs">
              <EyeOff size={10} /> Hidden
            </span>
          )}
        </div>
      </div>

      {/* Bottom Information Card Area (Matching Screenshot) */}
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2 bg-(--card-bg)">
        <h3 className="text-sm font-bold tracking-tight text-(--text-primary) line-clamp-1 group-hover:text-(--btn-primary-bg) transition">
          {title}
        </h3>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-(--text-muted) pt-1 border-t border-(--border-color)/40">
          {image.location ? (
            <span className="flex items-center gap-1 font-medium">
              <MapPin size={12} className="text-amber-500 shrink-0" />
              <span className="truncate max-w-[130px]">{image.location}</span>
            </span>
          ) : (
            <span />
          )}

          {image.date && (
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Calendar size={11} className="shrink-0" />
              {new Date(image.date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}