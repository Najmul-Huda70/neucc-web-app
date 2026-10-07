// components/dashboard/events/GalleryCropModal.tsx
"use client";

import { X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";

type GalleryCropModalProps = {
  imageSource: string;
  crop: { x: number; y: number };
  zoom: number;
  cropPixels: Area | null;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (pixels: Area) => void;
  onCancel: () => void;
  onApply: () => void;
};

export default function GalleryCropModal({
  imageSource,
  crop,
  zoom,
  cropPixels,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onApply,
}: GalleryCropModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-2xl border bg-(--card-bg) p-5 shadow-2xl"
        style={{ borderColor: "var(--btn-secondary-border)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-(--text-primary)">Crop gallery image</h3>
            <p className="mt-1 text-xs text-(--text-secondary)">Adjust the image for the gallery frame.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close gallery crop editor">
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSource}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={(_, pixels) => onCropComplete(pixels)}
            showGrid
            objectFit="contain"
          />
        </div>

        <label className="mt-4 block text-xs font-semibold text-(--text-primary)">
          Zoom
          <input
            aria-label="Gallery image zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="mt-2 w-full accent-(--btn-primary-bg)"
          />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "var(--btn-secondary-border)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={!cropPixels}
            className="rounded-lg bg-(--btn-primary-bg) px-4 py-2 text-xs font-bold text-(--btn-primary-text) disabled:opacity-50"
          >
            Use cropped image
          </button>
        </div>
      </div>
    </div>
  );
}