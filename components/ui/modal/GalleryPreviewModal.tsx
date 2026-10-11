"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button"; // 👈 Central Button Component Import
import { SourceGalleryImage } from "@/components/ui/card/GalleryCard";

interface GalleryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: SourceGalleryImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function GalleryPreviewModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}: GalleryPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const currentImage = images[currentIndex];

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    const nextIdx = (currentIndex + 1) % images.length;
    onIndexChange(nextIdx);
  }, [currentIndex, images.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    onIndexChange(prevIdx);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentImage) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    const toastId = toast.loading("Preparing image download...");

    try {
      const response = await fetch(currentImage.imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName =
        currentImage.caption?.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
        `neucc-gallery-${currentImage.galleryId || Date.now()}`;
      link.download = `${fileName}.jpg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
      toast.success("Download started!", { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Could not download image. Opening in new tab...", { id: toastId });
      window.open(currentImage.imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const titleText = currentImage.caption || currentImage.event?.title || "Club Photo";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-(--card-bg) border border-(--border-color) shadow-2xl animate-scale-up max-h-[95vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-(--border-color) bg-(--card-bg) z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-(--bg-subtle) text-(--text-muted) border border-(--border-color)">
              {currentIndex + 1} / {images.length}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-(--text-primary) line-clamp-1 max-w-[200px] sm:max-w-md">
              {titleText}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Standard Button Structure Integration */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isDownloading}
              disabled={isDownloading}
              onClick={handleDownload}
              title="Download Image"
            >
              <Download size={15} />
              <span className="hidden sm:inline">
                {isDownloading ? "Downloading..." : "Download"}
              </span>
            </Button>

            {/* ✅ Standard Close Icon Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="h-8 w-8 rounded-lg text-(--text-muted) hover:text-(--text-primary)"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="relative w-full flex-1 aspect-4/3 sm:aspect-16/10 max-h-[58vh] sm:max-h-[64vh] bg-(--bg-subtle) flex items-center justify-center overflow-hidden group">
          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition transform hover:scale-110 shadow-md cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Main Image */}
          <Image
            src={currentImage.imageUrl}
            alt={titleText}
            fill
            priority
            unoptimized
            className="object-contain transition-all duration-300 p-2"
            sizes="(max-width: 1024px) 100vw, 85vw"
          />

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next image"
              className="absolute right-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition transform hover:scale-110 shadow-md cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Metadata & Thumbnail Navigation Footer */}
        <div className="p-3 sm:p-4 bg-(--card-bg) border-t border-(--border-color) space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4 text-xs text-(--text-muted)">
              {currentImage.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-(--accent) shrink-0" />
                  <span>{currentImage.location}</span>
                </span>
              )}

              {currentImage.date && (
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar size={13} className="shrink-0 text-(--text-muted)" />
                  <span>
                    {new Date(currentImage.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </span>
              )}
            </div>

            {currentImage.event && (
              <Link
                href={`/events/${currentImage.event.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-(--text-secondary) hover:underline shrink-0"
              >
                <span>View Event</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar border-t border-(--border-color)/50">
              {images.map((img, idx) => (
                <button
                  key={img.galleryId || idx}
                  onClick={() => onIndexChange(idx)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    idx === currentIndex
                      ? "border-(--text-primary) scale-105 shadow-md ring-2 ring-(--text-primary)/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.caption || "Thumbnail"}
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}