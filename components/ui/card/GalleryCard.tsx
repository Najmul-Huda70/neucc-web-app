"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import Card from "./Card";

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

interface GalleryCardProps {
  image: SourceGalleryImage;
  onClick: () => void;
}

export default function GalleryCard({ image, onClick }: GalleryCardProps) {
  const cardTitle = image.caption || image.event?.title || "Club Photo";

  return (
    <div onClick={onClick} className="h-full cursor-pointer">
      <Card padding="none" className="h-full flex flex-col justify-between">
        <div>
          {/* Image Container with Event Tag Overlay */}
          <div className="relative aspect-4/3 w-full overflow-hidden bg-(--bg-subtle)">
            <Image
              src={image.imageUrl}
              alt={cardTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Event Tag Overlay */}
            {image.event && (
              <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-semibold text-white">
                {image.event.title}
              </span>
            )}
          </div>

          {/* Card Body Title */}
          <div className="p-3.5">
            <h3 className="line-clamp-2 text-xs font-bold text-(--text-primary) group-hover:text-(--text-secondary) transition-colors">
              {cardTitle}
            </h3>
          </div>
        </div>

        {/* Footer Meta Details */}
        <div className="mx-3.5 mb-3.5 flex flex-wrap items-center justify-between text-[11px] text-(--text-muted) pt-2 border-t border-(--border-color)">
          {image.location ? (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-(--accent) shrink-0" />
              <span className="truncate max-w-[120px]">{image.location}</span>
            </span>
          ) : (
            <span />
          )}

          {image.date && (
            <span className="flex items-center gap-1 font-mono">
              <Calendar size={12} className="shrink-0" />
              {new Date(image.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}