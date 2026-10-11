"use client";

import React from "react";
import Image from "next/image";
import { Handshake } from "lucide-react";
import Card from "./Card";

export interface SponsorItem {
  sponsorId: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  _count?: {
    eventSponsors: number;
  };
}

interface SponsorCardProps {
  sponsor: SponsorItem;
  className?: string;
}

export default function SponsorCard({ sponsor, className = "" }: SponsorCardProps) {
  const eventCount = sponsor._count?.eventSponsors || 0;

  return (
    <Card
      padding="md"
      className={`group flex-shrink-0 w-48 h-36 flex flex-col items-center justify-center text-center ${className}`}
    >
      {/* Fixed Image / Logo Container */}
      <div className="relative h-12 w-full flex items-center justify-center mb-2">
        {sponsor.logoUrl ? (
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            fill
            unoptimized
            className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        ) : (
          <Handshake className="w-8 h-8 text-(--text-muted)" />
        )}
      </div>

      {/* Company Name with Website Link */}
      {sponsor.website ? (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-(--text-primary) line-clamp-1 hover:text-(--text-secondary) hover:underline transition-colors"
        >
          {sponsor.name}
        </a>
      ) : (
        <h3 className="text-xs font-bold text-(--text-primary) line-clamp-1">
          {sponsor.name}
        </h3>
      )}

      {/* Event Count Info */}
      <p className="text-[10px] font-medium text-(--text-muted) mt-1">
        {eventCount}{" "}
        {eventCount === 1 ? "Event Sponsored" : "Events Sponsored"}
      </p>
    </Card>
  );
}