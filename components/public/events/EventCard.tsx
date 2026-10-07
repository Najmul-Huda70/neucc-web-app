"use client";

import { Calendar, CalendarDays, Check, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type PublicEventCardData = {
  eventId: string;
  slug: string;
  title: string;
  shortDescription: string;
  type: string;
  cardBannerUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  vanue?: string | null;
  committee: { type: string; year: number };
};

// তারিখ ফরম্যাট করার হেল্পার ফাংশন
function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return null;

  const start = new Date(startDate);
  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endDate) return startFormatted;

  const end = new Date(endDate);
  // যদি একই দিনে শুরু ও শেষ হয়
  if (start.toDateString() === end.toDateString()) {
    return startFormatted;
  }

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

export default function EventCard({ event }: { event: PublicEventCardData }) {
  const [copied, setCopied] = useState(false);

  // Copy URL handler
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link-এ রিডাইরেক্ট হওয়া আটকানোর জন্য
    e.stopPropagation();

    const eventUrl = `${window.location.origin}/events/${event.slug}`;

    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // ২ সেকেন্ড পর রিসেট হবে
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const formattedDate = formatEventDate(event.startDate, event.endDate);

  return (
    <Link 
      href={`/events/${event.slug}`} 
      className="group block overflow-hidden rounded-2xl border bg-(--card-bg) shadow-sm transition hover:-translate-y-1 hover:shadow-lg" 
      style={{ borderColor: "var(--btn-secondary-border)" }}
    >
      {event.cardBannerUrl ? (
        <div className="relative aspect-[2/1] w-full bg-(--stat-card-bg)">
          <Image 
            src={event.cardBannerUrl} 
            alt="" 
            fill 
            unoptimized 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            className="object-cover" 
          />
        </div>
      ) : (
        <div className="flex aspect-[2/1] items-end bg-(--stat-card-bg) p-5">
          <CalendarDays size={36} className="text-(--btn-primary-bg)/60" />
        </div>
      )}

      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--btn-primary-bg)">
          {event.type}
        </p>
        <h3 className="mt-2 text-lg font-black leading-tight">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--text-secondary)">
          {event.shortDescription}
        </p>

        {/* Date & Venue Section */}
        <div className="mt-4 flex flex-col gap-1.5 text-xs text-(--text-secondary)">
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0 text-(--btn-primary-bg)" />
              <span className="font-medium">{formattedDate}</span>
            </div>
          )}

          {event.vanue && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-(--btn-primary-bg)" />
              <span className="font-medium line-clamp-1">{event.vanue}</span>
            </div>
          )}
        </div>

        {/* Bottom Metadata & Copy Share Link Button */}
        <div 
          className="mt-5 flex items-center justify-between border-t pt-4" 
          style={{ borderColor: "var(--btn-secondary-border)" }}
        >
          {/* Committee Info */}
          <p className="text-left text-xs font-bold text-(--text-primary)">
            {event.committee.type} Committee · {event.committee.year}
          </p>

          {/* Copy Button with Icon + Text Feedback */}
          <button
            onClick={handleCopy}
            type="button"
            aria-label="Copy event link"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-(--text-secondary) transition-colors hover:bg-(--stat-card-bg) hover:text-(--btn-primary-bg)"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}