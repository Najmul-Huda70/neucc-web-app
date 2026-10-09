"use client";

import { Edit2, Save, Trash2, X, MapPin, Star, EyeOff } from "lucide-react";
import { SourceGalleryImage } from "../public/events/EditorialGallery";

type GalleryModalHeaderProps = {
  currentImage: SourceGalleryImage;
  title: string;
  isEditing: boolean;
  canManage: boolean;
  isSaving: boolean;
  editCaption: string;
  editLocation: string;
  onCaptionChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onEditClick: () => void;
  onSaveClick: () => void;
  onDeleteClick: () => void;
  onCloseClick: () => void;
};

export default function GalleryModalHeader({
  currentImage,
  title,
  isEditing,
  canManage,
  isSaving,
  editCaption,
  editLocation,
  onCaptionChange,
  onLocationChange,
  onEditClick,
  onSaveClick,
  onDeleteClick,
  onCloseClick,
}: GalleryModalHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-(--border-color) px-4 py-3 sm:px-6 sm:py-4">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="space-y-1.5">
            <input
              type="text"
              value={editCaption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Title / Caption..."
              className="w-full rounded-md border border-(--border-color) bg-(--bg-app) px-2.5 py-1 text-sm font-bold text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--btn-primary-bg)"
            />
            <div className="flex items-center gap-1 text-xs text-(--text-muted)">
              <MapPin size={12} className="text-(--accent) shrink-0" />
              <input
                type="text"
                value={editLocation}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="Venue / Location..."
                className="w-full rounded-md border border-(--border-color) bg-(--bg-app) px-2 py-0.5 text-xs text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--btn-primary-bg)"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-(--text-primary) sm:text-base">
                {title}
              </h2>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-(--text-muted)">
              <MapPin size={13} aria-hidden="true" /> {currentImage.location || "Event gallery"}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {canManage && (
          <>
            {!isEditing ? (
              <button
                type="button"
                onClick={onEditClick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--bg-app) px-3 py-1.5 text-xs font-semibold text-(--text-primary) transition hover:bg-(--card-hover) cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSaveClick}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-(--btn-primary-bg) px-3.5 py-1.5 text-xs font-bold text-(--btn-primary-text) transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDeleteClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onCloseClick}
          aria-label="Close image viewer"
          className="shrink-0 rounded-lg p-2 text-(--text-muted) transition hover:bg-(--card-hover) hover:text-(--text-primary) cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}