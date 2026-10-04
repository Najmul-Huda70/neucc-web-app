"use client";

import { ChevronLeft, ChevronRight, Download, MapPin, X } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
};

type EditorialGalleryProps = {
  images: SourceGalleryImage[];
};

function imageTitle(image: SourceGalleryImage, index: number) {
  return image.caption || `Event view ${index + 1}`;
}

export default function EditorialGallery({ images }: EditorialGalleryProps) {
  const visibleImages = images.slice(0, 6);
  const [visibleIndexes, setVisibleIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [previousIndexes, setPreviousIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [fadingCards, setFadingCards] = useState<boolean[]>(() => visibleImages.map(() => false));
  const [rotatingCard, setRotatingCard] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") setSelectedIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setSelectedIndex((current) => current === null ? null : (current + 1) % images.length);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, selectedIndex]);

  async function downloadImage(image: SourceGalleryImage, index: number) {
    const filename = `${imageTitle(image, index).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event-image"}.jpg`;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(image.imageUrl, "_blank", "noopener,noreferrer");
    }
  }

  useEffect(() => {
    if (images.length <= 6 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setVisibleIndexes((current) => {
        const replacement = Array.from({ length: images.length }, (_, index) => (nextImageIndex + index) % images.length).find((index) => !current.includes(index));
        if (replacement === undefined) return current;

        setPreviousIndexes((previous) => {
          const next = [...previous];
          next[rotatingCard] = current[rotatingCard];
          return next;
        });
        setFadingCards((fading) => {
          const next = [...fading];
          next[rotatingCard] = true;
          return next;
        });
        window.setTimeout(() => {
          setFadingCards((fading) => {
            const next = [...fading];
            next[rotatingCard] = false;
            return next;
          });
        }, 50);
        setNextImageIndex((replacement + 1) % images.length);

        const next = [...current];
        next[rotatingCard] = replacement;
        return next;
      });
      setRotatingCard((current) => (current + 1) % Math.min(images.length, 6));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, nextImageIndex, rotatingCard]);

  if (visibleImages.length === 0) return null;

  return (
    <section aria-labelledby="event-gallery-title" className="editorial-gallery mt-10">
      <div className="mb-7 sm:mb-9">
        <h2 id="event-gallery-title" className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">Gallery</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleImages.map((image, cardIndex) => {
          const currentImage = images[visibleIndexes[cardIndex]] || image;
          const previousImage = images[previousIndexes[cardIndex]] || currentImage;
          const isFading = fadingCards[cardIndex] ?? false;
          const title = imageTitle(currentImage, cardIndex);

          return (
            <article
              key={image.galleryId}
              className="editorial-gallery-card group relative aspect-[4/3] overflow-hidden bg-[#ded8cd] opacity-0 shadow-[0_10px_30px_rgba(53,43,30,0.08)] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#8e6b45]"
              style={{ "--gallery-delay": `${cardIndex * 80}ms` } as CSSProperties}
              tabIndex={0}
              role="button"
              aria-label={`${title}, ${currentImage.location || "Event gallery"}`}
              onClick={() => setSelectedIndex(visibleIndexes[cardIndex])}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedIndex(visibleIndexes[cardIndex]);
                }
              }}
            >
              <Image src={previousImage.imageUrl} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-out ${isFading ? "opacity-100" : "opacity-0"} group-hover:scale-105 group-focus-within:scale-105`} />
              <Image src={currentImage.imageUrl} alt={title} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={`absolute inset-0 object-cover transition-opacity duration-1000 ease-out ${isFading ? "opacity-0" : "opacity-100"} group-hover:scale-105 group-focus-within:scale-105`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-4 p-5 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mb-3 h-px w-0 bg-white/80 transition-all duration-700 group-hover:w-12 group-focus-within:w-12" />
                <h3 className="font-serif text-2xl leading-tight">{title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80"><MapPin size={13} aria-hidden="true" /> {currentImage.location || "Event gallery"}</p>
              </div>
            </article>
          );
        })}
      </div>

      {selectedIndex !== null && images[selectedIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Event image viewer" onClick={() => setSelectedIndex(null)}>
          <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden border border-white/15 bg-[#0d1110] shadow-2xl sm:max-h-[calc(100vh-3rem)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-white sm:text-base">{imageTitle(images[selectedIndex], selectedIndex)}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/55"><MapPin size={13} aria-hidden="true" /> {images[selectedIndex].location || "Event gallery"}</p>
              </div>
              <button type="button" onClick={() => setSelectedIndex(null)} aria-label="Close image viewer" className="shrink-0 rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#080b0a] p-3 sm:p-6">
              <Image src={images[selectedIndex].imageUrl} alt={imageTitle(images[selectedIndex], selectedIndex)} width={1600} height={1000} unoptimized className="max-h-[calc(100vh-12rem)] w-auto max-w-full object-contain" priority />
              {images.length > 1 && <>
                <button type="button" onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white transition hover:bg-[#288c83] sm:left-5"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2.5 text-white transition hover:bg-[#288c83] sm:right-5"><ChevronRight size={20} /></button>
              </>}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
              <span className="text-xs font-medium tracking-wide text-white/50">{selectedIndex + 1} / {images.length}</span>
              <button type="button" onClick={() => downloadImage(images[selectedIndex], selectedIndex)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-[#288c83]" title="Download image"><Download size={15} /> Download</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
