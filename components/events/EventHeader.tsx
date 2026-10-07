"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";

export type EventHeaderData = {
  title: string;
  shortDescription?: string;
  type: string;
  status?: string;
  detailBannerUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  vanue?: string | null;
  committee: { type: string; year: number };
};

function formatEventDate(startDate?: string | Date | null, endDate?: string | Date | null) {
  if (!startDate) return null;

  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endDate) return startFormatted;

  const end = new Date(endDate);
  if (isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return startFormatted;
  }

  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

export default function EventHeader({
  title,
  type,
  detailBannerUrl,
  startDate,
  endDate,
  vanue,
  committee,
}: EventHeaderData) {
  const formattedDate = formatEventDate(startDate, endDate);

  // Framer Motion Stagger Parent Variant
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  // Children Animation Variant with strict TypeScript typing
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <header className="relative isolate aspect-[2.2/1] min-h-[320px] w-full overflow-hidden bg-[#0f172a] text-white shadow-xl sm:min-h-[420px]">
      {/* Background Banner with Motion Scale & Fade Effect */}
      {detailBannerUrl ? (
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 -z-20 h-full w-full"
        >
          <Image
            src={detailBannerUrl}
            alt={title}
            fill
            unoptimized
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1e293b] to-[#0f172a]" />
      )}

      {/* Dark Gradient Overlay for High Contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12"
      >
        {/* Top Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
        >
          {/* Top Left: Type with indicator */}
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>— {type}</span>
          </div>

          {/* Top Right: Committee & Year */}
          <div className="font-mono text-right tracking-wider text-white/90">
            <div>{committee?.type}</div>
            <div className="text-xs text-emerald-300/70">{committee?.year}</div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6">
          {/* Event Title */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          {/* Date & Venue Footer Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/20 pt-4 text-xs font-semibold text-gray-300 sm:text-sm"
          >
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {/* Date Block */}
              {formattedDate ? (
                <div>
                  <span className="text-gray-400">Date: </span>
                  <span className="text-white">{formattedDate}</span>
                </div>
              ) : (
                startDate && (
                  <div>
                    <span className="text-gray-400">Date: </span>
                    <span className="text-white">{String(startDate)}</span>
                  </div>
                )
              )}

              {/* Venue Block */}
              {vanue && (
                <div>
                  <span className="text-gray-400">Venue: </span>
                  <span className="text-white">{vanue}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}