"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { SourceGalleryImage } from "../public/events/EditorialGallery";


type GalleryModalBodyProps = {
  currentImage: SourceGalleryImage;
  title: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  totalImages: number;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (area: Area, pixels: Area) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function GalleryModalBody({
  currentImage,
  title,
  isEditing,
  hasUnsavedChanges,
  totalImages,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onPrev,
  onNext,
}: GalleryModalBodyProps) {
  return (
    <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-black p-3 sm:p-6 overflow-hidden">
      {isEditing ? (
        <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black">
          <Cropper
            image={currentImage.imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            showGrid
            objectFit="contain"
          />
        </div>
      ) : (
        <>
          <Image
            key={currentImage.galleryId}
            src={currentImage.imageUrl}
            alt={title}
            width={1600}
            height={1000}
            unoptimized
            className="max-h-[calc(100vh-14rem)] w-auto max-w-full object-contain transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
            priority
          />

          {totalImages > 1 && !hasUnsavedChanges && (
            <>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white transition-all hover:scale-110 hover:bg-(--btn-primary-bg) sm:left-5 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white transition-all hover:scale-110 hover:bg-(--btn-primary-bg) sm:right-5 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}