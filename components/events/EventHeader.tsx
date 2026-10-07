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

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -25 },
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
    <header className="relative isolate aspect-[2.2/1] min-h-[320px] w-full overflow-hidden bg-[#faf8f3] border-b border-[#d9d5cc] sm:min-h-[420px]">
      {/* Background Banner - Full Clear & Sharp */}
      {detailBannerUrl ? (
        <motion.div
          initial={{ scale: 1.03, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#faf8f3] to-[#ebd2ba]/40" />
      )}

      {/* Subtle Bottom Vignette Gradient for Text Contrast */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex h-full flex-col justify-between p-6 sm:p-10 lg:p-12 text-white"
      >
        {/* Top Section */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] sm:text-sm drop-shadow-md"
        >
          {/* Top Left: Type */}
          <div className="flex items-center gap-2 text-[#f3e5d8]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#e2b887]" />
            <span>— {type}</span>
          </div>

          {/* Top Right: Committee & Year */}
          <div className="font-mono text-right tracking-wider text-white">
            <div>{committee?.type}</div>
            <div className="text-xs text-[#dcd6cd]">{committee?.year}</div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6">
          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-2xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          {/* Date & Venue Footer Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/30 pt-4 text-xs font-semibold text-gray-200 sm:text-sm drop-shadow-md"
          >
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {/* Date Block */}
              {formattedDate ? (
                <div>
                  <span className="text-gray-300">Date: </span>
                  <span className="font-bold text-white">{formattedDate}</span>
                </div>
              ) : (
                startDate && (
                  <div>
                    <span className="text-gray-300">Date: </span>
                    <span className="font-bold text-white">{String(startDate)}</span>
                  </div>
                )
              )}

              {/* Venue Block */}
              {vanue && (
                <div>
                  <span className="text-gray-300">Venue: </span>
                  <span className="font-bold text-white">{vanue}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}