"use client";

import { useState } from "react";
import { getInitials } from "./sponsors-hero.utils";

type SponsorLogoProps = {
  name: string;
  src: string | null;
  className?: string;
  fallbackClassName?: string;
  /** What to show when there is no logo (or it fails to load). */
  fallback?: "initials" | "name";
};

// Tiny client island: only needed so a broken logo URL falls back to initials.
export default function SponsorLogo({
  name,
  src,
  className = "",
  fallbackClassName = "size-14 rounded-xl text-lg",
  fallback = "initials",
}: SponsorLogoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    if (fallback === "name") {
      return (
        <span className={`text-center font-semibold text-slate-700 ${fallbackClassName}`}>
          {name}
        </span>
      );
    }
    return (
      <span
        aria-hidden
        className={`flex items-center justify-center bg-teal-50 font-medium text-teal-700 ${fallbackClassName}`}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- sponsor logos come from arbitrary hosts
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}