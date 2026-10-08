"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { Camera } from "lucide-react";

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
  canManage?: boolean;
  onEditImage?: () => void;
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
  canManage,
  onEditImage,
}: EventHeaderData) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
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
    <header className="relative isolate aspect-[2.2/1] min-h-[320px] w-full overflow-hidden bg-[#2d2926] border-b border-[#d9d5cc] sm:min-h-[420px]">
      {/* Background Banner */}
      {detailBannerUrl ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isImageLoaded ? 0.95 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 -z-20 h-full w-full"
        >
          <Image
            src={detailBannerUrl}
            alt={title}
            fill
            priority
            unoptimized
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
            onLoad={() => setIsImageLoaded(true)}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1a1918] to-[#3a3530]" />
      )}

      {/* Placeholder de carregamento enquanto a imagem baixa */}
      {detailBannerUrl && !isImageLoaded && (
        <div className="absolute inset-0 -z-20 animate-pulse bg-[#2d2926]" />
      )}

      {/* Subtle Bottom Vignette Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      {/* Top Right: Image Edit Icon Button */}
      {canManage && (
        <button
          type="button"
          onClick={onEditImage}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/80 hover:scale-105"
        >
          <Camera size={14} />
          <span>Edit Banner</span>
        </button>
      )}

      {/* Main Content Overlay */}
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
          <div className="flex items-center gap-2 text-[#f3e5d8]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#e2b887]" />
            <span>— {type}</span>
          </div>

          <div className="font-mono text-right tracking-wider text-white">
            <div>{committee?.type}</div>
            <div className="text-xs text-[#dcd6cd]">{committee?.year}</div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6">
          <motion.h1
            variants={itemVariants}
            className="font-serif text-2xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
          >
            {title}
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/30 pt-4 text-xs font-semibold text-gray-200 sm:text-sm drop-shadow-md"
          >
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
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