"use client";

import Link from "next/link";
import { Compass, ArrowLeft, Home } from "lucide-react";

type NotFoundCardProps = {
  title?: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
};

export default function NotFoundCard({
  title = "Page Not Found",
  description = "The page or resource you are looking for doesn't exist, has been moved, or is temporarily unavailable.",
  backUrl = "/events",
  backLabel = "Explore Events",
}: NotFoundCardProps) {
  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-(--border-color) bg-(--card-bg) p-8 text-center shadow-xl backdrop-blur-md sm:p-10">
        {/* Glow / Ambient Subtle Background Effect */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-(--btn-primary-bg)/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-(--btn-primary-bg)/10 blur-2xl" />

        {/* 404 Icon & Badge */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-(--border-color) bg-(--bg-app) text-(--btn-primary-bg) shadow-inner">
          <Compass className="h-10 w-10 animate-pulse stroke-[1.5]" />
          <span className="absolute -top-2 -right-2 rounded-md bg-(--btn-primary-bg) px-2 py-0.5 text-[10px] font-extrabold uppercase text-(--btn-primary-text)">
            404
          </span>
        </div>

        {/* Text Content */}
        <h2 className="mb-3 text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          {title}
        </h2>
        <p className="mb-8 text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href={backUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2.5 text-xs font-semibold text-(--btn-primary-text) transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--card-bg) px-5 py-2.5 text-xs font-semibold text-(--text-primary) transition-all duration-200 hover:bg-(--card-hover) active:scale-95"
          >
            <Home size={14} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}