"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Card from "@/components/ui/card/Card";

export interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: Date | string | null;
  isHero?: boolean;
  isPublic?: boolean;
  eventId?: string | null;
  event?: {
    slug: string;
    title: string;
  } | null;
}

interface GallerySectionProps {
  images: GalleryImage[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  if (!images || images.length === 0) return null;

  // Split images into two rows
  const half = Math.ceil(images.length / 2);
  const row1 = images.slice(0, half);
  const row2 = images.slice(half);

  // Seamless looping image duplication
  const row1Images = [...row1, ...row1, ...row1];
  const row2Images = row2.length > 0 ? [...row2, ...row2, ...row2] : [];

  return (
    <section className="py-6 sm:py-10 bg-(--bg-app) overflow-hidden">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
            Life at NEUCC
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-(--text-muted) font-medium">
            Glimpses of our activities, events, and memorable moments
          </p>
        </div>

        {/* Gallery Motion Container */}
        <div className="relative w-full overflow-hidden space-y-4 sm:space-y-6">
          {/* Left & Right Gradient Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-(--bg-app) to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-(--bg-app) to-transparent z-10 pointer-events-none" />

          {/* Row 1: Right to Left (0% -> -33.33%) */}
          <div className="flex w-max">
            <motion.div
              className="flex gap-4 sm:gap-6 pr-4 sm:pr-6"
              animate={{
                x: ["0%", "-33.333%"],
              }}
              transition={{
                ease: "linear",
                duration: 35,
                repeat: Infinity,
              }}
            >
              {row1Images.map((img, idx) => {
                const cardTitle = img.caption || img.event?.title || "NEUCC Gallery Image";
                return (
                  <Card
                    key={`row1-${img.galleryId}-${idx}`}
                    padding="none"
                    className="group relative aspect-4/3 h-48 sm:h-56 shrink-0 overflow-hidden bg-(--bg-subtle) hover:-translate-y-1 transition duration-300"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={cardTitle}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Card>
                );
              })}
            </motion.div>
          </div>

          {/* Row 2: Left to Right (-33.33% -> 0%) */}
          {row2Images.length > 0 && (
            <div className="flex w-max">
              <motion.div
                className="flex gap-4 sm:gap-6 pr-4 sm:pr-6"
                animate={{
                  x: ["-33.333%", "0%"],
                }}
                transition={{
                  ease: "linear",
                  duration: 35,
                  repeat: Infinity,
                }}
              >
                {row2Images.map((img, idx) => {
                  const cardTitle = img.caption || img.event?.title || "NEUCC Gallery Image";
                  return (
                    <Card
                      key={`row2-${img.galleryId}-${idx}`}
                      padding="none"
                      className="group relative aspect-4/3 h-48 sm:h-56 shrink-0 overflow-hidden bg-(--bg-subtle) hover:-translate-y-1 transition duration-300"
                    >
                      <Image
                        src={img.imageUrl}
                        alt={cardTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Card>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}