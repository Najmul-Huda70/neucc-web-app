"use client";

import { Eye, EyeOff, Star, Download } from "lucide-react";
import { SourceGalleryImage } from "../public/events/EditorialGallery";

type GalleryModalFooterProps = {
  currentImage: SourceGalleryImage;
  currentIndex: number;
  totalImages: number;
  isEditing: boolean;
  editDate: string;
  editIsPublic: boolean;
  editIsHero: boolean;
  onDateChange: (val: string) => void;
  onIsPublicChange: (val: boolean) => void;
  onIsHeroChange: (val: boolean) => void;
  onDownload: () => void;
};

export default function GalleryModalFooter({
  currentImage,
  currentIndex,
  totalImages,
  isEditing,
  editDate,
  editIsPublic,
  editIsHero,
  onDateChange,
  onIsPublicChange,
  onIsHeroChange,
  onDownload,
}: GalleryModalFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--border-color) px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="text-xs font-medium tracking-wide text-(--text-muted)">
          {currentIndex + 1} / {totalImages}
        </span>

        {isEditing ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-1">
              <span className="text-xs font-semibold text-(--text-secondary)">Date:</span>
              <input
                type="date"
                value={editDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-xs text-(--text-primary) focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsPublic}
                onChange={(e) => onIsPublicChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-(--btn-primary-bg)"
              />
              {editIsPublic ? (
                <Eye size={13} className="text-emerald-500" />
              ) : (
                <EyeOff size={13} className="text-slate-400" />
              )}
              <span className="text-xs font-semibold text-(--text-primary)">
                {editIsPublic ? "Public" : "Hidden"}
              </span>
            </label>

            <label className="flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsHero}
                onChange={(e) => onIsHeroChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-(--btn-primary-bg)"
              />
              <Star
                size={13}
                className={editIsHero ? "fill-amber-400 text-amber-500" : "text-slate-400"}
              />
              <span className="text-xs font-semibold text-(--text-primary)">Feature in Hero</span>
            </label>
          </>
        ) : (
          <>
            {currentImage.date && (
              <span className="rounded-md border border-(--border-color) bg-(--bg-app) px-2.5 py-1 text-xs text-(--text-muted)">
                Date: {new Date(currentImage.date).toLocaleDateString()}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${
                currentImage.isPublic !== false
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-slate-500/30 bg-slate-500/10 text-slate-500"
              }`}
            >
              {currentImage.isPublic !== false ? (
                <>
                  <Eye size={12} /> Public
                </>
              ) : (
                <>
                  <EyeOff size={12} /> Hidden
                </>
              )}
            </span>

            {currentImage.isHero && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Star size={12} className="fill-amber-500 text-amber-500" /> Featured in Hero
              </span>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-2 text-xs font-bold text-(--text-primary) transition hover:bg-(--card-hover) cursor-pointer"
          title="Download image"
        >
          <Download size={15} /> Download
        </button>
      )}
    </div>
  );
}