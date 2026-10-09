"use client";

import { useEffect, useState } from "react";
import type { Area } from "react-easy-crop";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import GalleryGridItem from "@/components/gallery/GalleryGridItem";
import EditorialGalleryModal from "@/components/gallery/EditorialGalleryModal";
import GalleryModalHeader from "@/components/gallery/GalleryModalHeader";
import GalleryModalBody from "@/components/gallery/GalleryModalBody";
import GalleryModalFooter from "@/components/gallery/GalleryModalFooter";


export type SourceGalleryImage = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
  isPublic?: boolean;
  isHero?: boolean;
};

type EditorialGalleryProps = {
  images: SourceGalleryImage[];
  canManage?: boolean;
  onSaveImage?: (updatedData: {
    galleryId: string;
    caption: string;
    location: string;
    date: string;
    isPublic: boolean;
    isHero: boolean;
    croppedImageFile?: File | null;
  }) => Promise<void>;
  onDeleteImage?: (galleryId: string) => Promise<void>;
};

function imageTitle(image: SourceGalleryImage, index: number) {
  return image.caption || `Event view ${index + 1}`;
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Failed to get canvas context"));

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas is empty"));
          resolve(new File([blob], "edited-gallery-image.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92
      );
    };
    image.onerror = (error) => reject(error);
  });
}

export default function EditorialGallery({
  images,
  canManage = false,
  onSaveImage,
  onDeleteImage,
}: EditorialGalleryProps) {
  const visibleImages = images.slice(0, 6);
  const [visibleIndexes, setVisibleIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [previousIndexes, setPreviousIndexes] = useState(() => visibleImages.map((_, index) => index));
  const [fadingCards, setFadingCards] = useState<boolean[]>(() => visibleImages.map(() => false));
  const [rotatingCard, setRotatingCard] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editIsHero, setEditIsHero] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleOpenModal = (index: number) => {
    const currentImg = images[index];
    if (currentImg) {
      setEditCaption(currentImg.caption || "");
      setEditLocation(currentImg.location || "");
      setEditDate(currentImg.date ? new Date(currentImg.date).toISOString().slice(0, 10) : "");
      setEditIsPublic(currentImg.isPublic !== false);
      setEditIsHero(currentImg.isHero === true);
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setConfirmDeleteOpen(false);
    setDeleteError(null);
    setSelectedIndex(index);

    setIsModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const handleCloseModal = () => {
    if (isDeleting) return;
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes! Please save your changes before closing.")) {
        return;
      }
    }

    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalMounted(false);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setConfirmDeleteOpen(false);
      setSelectedIndex(null);
    }, 250);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (hasUnsavedChanges || confirmDeleteOpen) return;
      if (event.key === "Escape") handleCloseModal();
      if (event.key === "ArrowLeft")
        setSelectedIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length));
      if (event.key === "ArrowRight")
        setSelectedIndex((current) => (current === null ? null : (current + 1) % images.length));
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, selectedIndex, hasUnsavedChanges, confirmDeleteOpen]);

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
        const replacement = Array.from(
          { length: images.length },
          (_, index) => (nextImageIndex + index) % images.length
        ).find((index) => !current.includes(index));
        if (replacement === undefined) return current;

        setFadingCards((fading) => {
          const next = [...fading];
          next[rotatingCard] = true;
          return next;
        });

        setTimeout(() => {
          setPreviousIndexes((previous) => {
            const next = [...previous];
            next[rotatingCard] = current[rotatingCard];
            return next;
          });

          setFadingCards((fading) => {
            const next = [...fading];
            next[rotatingCard] = false;
            return next;
          });
        }, 500);

        setNextImageIndex((replacement + 1) % images.length);

        const next = [...current];
        next[rotatingCard] = replacement;
        return next;
      });
      setRotatingCard((current) => (current + 1) % Math.min(images.length, 6));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [images.length, nextImageIndex, rotatingCard]);

  const handleSave = async () => {
    if (selectedIndex === null || !images[selectedIndex]) return;
    const currentImg = images[selectedIndex];

    try {
      setIsSaving(true);
      let croppedFile: File | null = null;

      if (croppedAreaPixels) {
        croppedFile = await getCroppedImg(currentImg.imageUrl, croppedAreaPixels);
      }
      if (onSaveImage) {
        await onSaveImage({
          galleryId: currentImg.galleryId,
          caption: editCaption,
          location: editLocation,
          date: editDate,
          isPublic: editIsPublic,
          isHero: editIsHero,
          croppedImageFile: croppedFile,
        });
      }

      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedIndex === null || !images[selectedIndex]) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      if (onDeleteImage) {
        await onDeleteImage(images[selectedIndex].galleryId);
      }
      setConfirmDeleteOpen(false);
      setHasUnsavedChanges(false);
      setIsEditing(false);
      handleCloseModal();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete item.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (visibleImages.length === 0) return null;

  const currentModalImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <section aria-labelledby="event-gallery-title" className="editorial-gallery">
      {/* 1. Grid Segment */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleImages.map((image, cardIndex) => {
          const currentImage = images[visibleIndexes[cardIndex]] || image;
          const previousImage = images[previousIndexes[cardIndex]] || currentImage;
          const isFading = fadingCards[cardIndex] ?? false;
          const title = imageTitle(currentImage, cardIndex);

          return (
            <GalleryGridItem
              key={image.galleryId}
              image={currentImage}
              previousImage={previousImage}
              isFading={isFading}
              cardIndex={cardIndex}
              title={title}
              canManage={canManage} // <-- pass canManage prop
              onClick={() => handleOpenModal(visibleIndexes[cardIndex])}
            />
          );
        })}
      </div>

      {/* 2. Modal Segment */}
      {currentModalImage && (
        <EditorialGalleryModal
          isModalMounted={isModalMounted}
          isModalVisible={isModalVisible}
          onCloseModal={handleCloseModal}
        >
          <GalleryModalHeader
            currentImage={currentModalImage}
            title={imageTitle(currentModalImage, selectedIndex ?? 0)}
            isEditing={isEditing}
            canManage={canManage}
            isSaving={isSaving}
            editCaption={editCaption}
            editLocation={editLocation}
            onCaptionChange={(val) => {
              setEditCaption(val);
              setHasUnsavedChanges(true);
            }}
            onLocationChange={(val) => {
              setEditLocation(val);
              setHasUnsavedChanges(true);
            }}
            onEditClick={() => setIsEditing(true)}
            onSaveClick={handleSave}
            onDeleteClick={() => {
              setDeleteError(null);
              setConfirmDeleteOpen(true);
            }}
            onCloseClick={handleCloseModal}
          />

          <GalleryModalBody
            currentImage={currentModalImage}
            title={imageTitle(currentModalImage, selectedIndex ?? 0)}
            isEditing={isEditing}
            hasUnsavedChanges={hasUnsavedChanges}
            totalImages={images.length}
            crop={crop}
            zoom={zoom}
            onCropChange={(newCrop) => {
              setCrop(newCrop);
              setHasUnsavedChanges(true);
            }}
            onZoomChange={(newZoom) => {
              setZoom(newZoom);
              setHasUnsavedChanges(true);
            }}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            onPrev={() =>
              setSelectedIndex((current) =>
                current === null ? null : (current - 1 + images.length) % images.length
              )
            }
            onNext={() =>
              setSelectedIndex((current) =>
                current === null ? null : (current + 1) % images.length
              )
            }
          />

          <GalleryModalFooter
            currentImage={currentModalImage}
            currentIndex={selectedIndex ?? 0}
            totalImages={images.length}
            isEditing={isEditing}
            editDate={editDate}
            editIsPublic={editIsPublic}
            editIsHero={editIsHero}
            onDateChange={(val) => {
              setEditDate(val);
              setHasUnsavedChanges(true);
            }}
            onIsPublicChange={(val) => {
              setEditIsPublic(val);
              setHasUnsavedChanges(true);
            }}
            onIsHeroChange={(val) => {
              setEditIsHero(val);
              setHasUnsavedChanges(true);
            }}
            onDownload={() => downloadImage(currentModalImage, selectedIndex ?? 0)}
          />
        </EditorialGalleryModal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={confirmDeleteOpen && currentModalImage !== null}
        title="Delete this image?"
        description={
          <>
            {currentModalImage?.caption ? (
              <>
                <span className="font-semibold text-(--text-primary)">
                  “{currentModalImage.caption}”
                </span>{" "}
                will be permanently removed from the gallery.
              </>
            ) : (
              "This image will be permanently removed from the gallery."
            )}{" "}
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete image"
        loading={isDeleting}
        error={deleteError}
        lockScroll={false}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </section>
  );
}