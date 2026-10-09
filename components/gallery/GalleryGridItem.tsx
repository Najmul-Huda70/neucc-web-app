"use client";

import Image from "next/image";
import { MapPin, EyeOff, Star, Eye } from "lucide-react";
import type { CSSProperties } from "react";
import { SourceGalleryImage } from "../public/events/EditorialGallery";

type GalleryGridItemProps = {
  image: SourceGalleryImage;
  previousImage: SourceGalleryImage;
  isFading: boolean;
  cardIndex: number;
  title: string;
  canManage?: boolean; // <-- 1. canManage prop add kora hoilo
  onClick: () => void;
};

export default function GalleryGridItem({
  image,
  previousImage,
  isFading,
  cardIndex,
  title,
  canManage = false, // <-- 2. Default false rakha hoilo
  onClick,
}: GalleryGridItemProps) {
  return (
    <article
      className="editorial-gallery-card group relative aspect-4/3 overflow-hidden rounded-sm bg-(--card-bg) border border-(--border-color) transition-all duration-300 hover:shadow-lg focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-(--btn-primary-bg) cursor-pointer"
      style={{ "--gallery-delay": `${cardIndex * 80}ms` } as CSSProperties}
      tabIndex={0}
      role="button"
      aria-label={`${title}, ${image.location || "Event gallery"}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Image
        src={previousImage.imageUrl}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`absolute inset-0 object-cover transition-all duration-700 ease-in-out ${
          isFading ? "opacity-100 scale-100" : "opacity-0 scale-105"
        } group-hover:scale-105`}
      />
      <Image
        src={image.imageUrl}
        alt={title}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`absolute inset-0 object-cover transition-all duration-700 ease-in-out ${
          isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
        } group-hover:scale-105`}
      />

      {/* Status Badges - Shudhu canManage = true thaklei (Dashboard e) dekhabe */}
      {canManage && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {/* Hero Badge */}
          {image.isHero && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Star size={10} className="fill-white" /> Hero
            </span>
          )}

          {/* Public vs Hidden Badge */}
          {image.isPublic !== false ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              <Eye size={10} /> Public
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-200 shadow-xs">
              <EyeOff size={10} /> Hidden
            </span>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="mb-3 h-px w-0 bg-white/80 transition-all duration-500 group-hover:w-12 group-focus-within:w-12" />
        <h3 className="text-xl font-bold tracking-tight leading-tight">{title}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80">
          <MapPin size={13} aria-hidden="true" /> {image.location || "Event gallery"}
        </p>
      </div>
    </article>
  );
}