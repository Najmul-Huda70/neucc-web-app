"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type HeroSlide = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | Date | null;
};

type Props = {
  initialSlides: HeroSlide[];
};

export default function HeroSlider({ initialSlides }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (initialSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % initialSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [initialSlides.length]);

  if (!initialSlides || initialSlides.length === 0) return null;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? initialSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % initialSlides.length);
  };

  const current = initialSlides[currentSlide];
  const slideIndexDisplay = String(currentSlide + 1).padStart(2, "0");
  const totalSlidesDisplay = String(initialSlides.length).padStart(2, "0");

  const formattedDate = current.date
    ? new Date(current.date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <section className="relative w-full bg-neutral-950 overflow-hidden select-none">
      <div className="relative w-full aspect-[2.2/1] min-h-[350px] max-h-[750px] flex items-center justify-center">
        
        {/* Background Images with Motion */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.galleryId}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={current.imageUrl}
              alt={current.caption || "Hero image"}
              fill
              priority
              className="object-cover w-full h-full"
              sizes="100vw"
            />
            {/* Gradient Overlay for better readability when bottom aligned */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Text Overlay - Lower Positioned (`justify-end` & bottom padding) */}
        <div className="relative z-20 flex h-full w-full flex-col items-center justify-end px-4 pb-14 sm:pb-20 lg:pb-24 text-center text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.galleryId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center max-w-4xl"
            >
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif tracking-tight leading-tight text-white drop-shadow-md">
                {current.caption || "NEU Computer Club"}
              </h1>

              <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs md:text-sm font-medium tracking-wider text-white/90">
                {current.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-amber-400 shrink-0" />
                    {current.location}
                  </span>
                )}

                {current.location && formattedDate && <span className="opacity-40">—</span>}

                {formattedDate && <span>{formattedDate}</span>}
              </div>

              <div className="mt-3 sm:mt-5">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 border-b border-white/70 pb-0.5 text-[11px] sm:text-xs md:text-sm font-medium tracking-widest text-white uppercase transition-all duration-300 hover:border-amber-400 hover:text-amber-400 hover:gap-3"
                >
                  <span>Explore Events</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        {initialSlides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-8 z-30 flex items-center gap-2 sm:gap-4">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-all hover:border-white hover:bg-black/70 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-white/80">
              <div className="relative h-0.5 w-8 sm:w-16 bg-white/30 overflow-hidden rounded-full">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSlide + 1) / initialSlides.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
              <span>
                {slideIndexDisplay} / {totalSlidesDisplay}
              </span>
            </div>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-400 text-black transition-all hover:bg-amber-300 active:scale-95 cursor-pointer"
            >
              <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}