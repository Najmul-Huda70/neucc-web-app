// components/dashboard/events/EventRelationsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import type { Area } from "react-easy-crop";

import EventGallerySection, { type PublicEventGallery } from "./EventGallerySection";
import GalleryCropModal from "./GalleryCropModal";
import RelationEditorModal, { type GalleryRelation, type SponsorOption } from "./RelationEditorModal";
import SponsorCard, { type SponsorRelation } from "./SponsorCard";

type RelationManagerProps = {
  eventId: string;
  eventSponsors: SponsorRelation[];
  galleries: GalleryRelation[];
  canManage: boolean;
  onChanged: () => void;
};

type RelationKind = "sponsor" | "gallery";

function createGalleryCrop(imageSrc: string, crop: Area) {
  return new Promise<File>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Unable to prepare the gallery image."));
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(new File([blob], "gallery-image.jpg", { type: "image/jpeg" }))
            : reject(new Error("Unable to export the gallery image.")),
        "image/jpeg",
        0.92
      );
    };
    image.onerror = () => reject(new Error("Unable to read the gallery image."));
    image.src = imageSrc;
  });
}

export default function EventRelationsPanel({
  eventId,
  eventSponsors,
  galleries,
  canManage,
  onChanged,
}: RelationManagerProps) {
  const [editor, setEditor] = useState<{ kind: RelationKind; item?: SponsorRelation | GalleryRelation } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [galleryCropSource, setGalleryCropSource] = useState("");
  const [galleryCropFile, setGalleryCropFile] = useState<File | null>(null);
  const [galleryCrop, setGalleryCrop] = useState({ x: 0, y: 0 });
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [galleryCropPixels, setGalleryCropPixels] = useState<Area | null>(null);
  const [sponsorOptions, setSponsorOptions] = useState<SponsorOption[]>([]);

  useEffect(() => {
    fetch("/api/sponsors")
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) setSponsorOptions(data.data ?? []);
      })
      .catch(() => undefined);
  }, []);

  const openEditor = (kind: RelationKind, item?: SponsorRelation | GalleryRelation) => {
    setError(null);
    setGalleryCropFile(null);
    setEditor({ kind, item });
  };

  const saveRelation = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError(null);

    try {
      const form = new FormData(formEvent.currentTarget);
      const payload: Record<string, unknown> = { relation: editor.kind };
      form.forEach((value, key) => {
        if (key !== "image" && key !== "logo") payload[key] = value;
      });

      if (editor.kind === "sponsor") {
        payload.isPublic = form.get("isPublic") === "on";
        const logo = form.get("logo");
        if (logo instanceof File && logo.size > 0) {
          const uploadBody = new FormData();
          uploadBody.append("file", logo);
          const uploadResponse = await fetch("/api/uploads", { method: "POST", body: uploadBody });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) throw new Error(uploadData.message || "Sponsor logo upload failed.");
          payload.logoUrl = uploadData.data.url;
        }
      }

      if (editor.kind === "gallery") {
        payload.isPublic = form.get("isPublic") === "on";
        const image = form.get("image");
        if (image instanceof File && image.size > 0 && !galleryCropFile) {
          setGalleryCropSource(URL.createObjectURL(image));
          setGalleryCrop({ x: 0, y: 0 });
          setGalleryZoom(1);
          setGalleryCropPixels(null);
          setBusy(false);
          return;
        }
        if (image instanceof File && image.size > 0) {
          const uploadBody = new FormData();
          uploadBody.append("file", galleryCropFile || image);
          const uploadResponse = await fetch("/api/uploads", { method: "POST", body: uploadBody });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) throw new Error(uploadData.message || "Gallery image upload failed.");
          payload.imageUrl = uploadData.data.url;
        }
        if (!payload.imageUrl && !editor.item) throw new Error("Choose a gallery image.");
      }

      if (editor.item) payload.relationId = "id" in editor.item ? editor.item.id : editor.item.galleryId;

      const response = await fetch(`/api/events/${eventId}/relations`, {
        method: editor.item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save relation.");

      setEditor(null);
      setGalleryCropFile(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save relation.");
    } finally {
      setBusy(false);
    }
  };

  const deleteRelation = async (kind: RelationKind, relationId: string) => {
    if (!window.confirm("Remove this item from the event?")) return;
    const response = await fetch(`/api/events/${eventId}/relations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relation: kind, relationId }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete relation.");
      return;
    }
    onChanged();
  };

  const cancelGalleryCrop = () => {
    if (galleryCropSource) URL.revokeObjectURL(galleryCropSource);
    setGalleryCropSource("");
    setGalleryCropPixels(null);
  };

  const applyGalleryCrop = async () => {
    if (!galleryCropSource || !galleryCropPixels) return;
    try {
      setGalleryCropFile(await createGalleryCrop(galleryCropSource, galleryCropPixels));
      cancelGalleryCrop();
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Unable to crop the gallery image.");
    }
  };

  const publicGalleries: PublicEventGallery[] = galleries.map((g) => ({
    galleryId: g.galleryId,
    imageUrl: g.imageUrl,
    caption: g.caption,
    location: g.location,
  }));

  return (
    <div className="space-y-8">
      {/* 1. Event Sponsors Section */}
      <section className="rounded-2xl border bg-(--card-bg) p-6 shadow-sm" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-(--text-primary)">
            <Users size={18} className="text-(--btn-primary-bg)" />
            <span>Event Sponsors</span>
          </h2>
          {canManage && (
            <button
              type="button"
              onClick={() => openEditor("sponsor")}
              className="flex items-center gap-1.5 rounded-lg border bg-(--stat-card-bg) px-3 py-1.5 text-xs font-bold text-(--text-primary) transition hover:border-(--btn-primary-bg)"
              style={{ borderColor: "var(--btn-secondary-border)" }}
            >
              <Plus size={14} />
              <span>Add Sponsor</span>
            </button>
          )}
        </div>

        {eventSponsors.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-xs text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}>
            No sponsors added to this event yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventSponsors.map((item) => (
              <SponsorCard
                key={item.id}
                item={item}
                canManage={canManage}
                onEdit={(itemToEdit) => openEditor("sponsor", itemToEdit)}
                onDelete={(idToDelete) => deleteRelation("sponsor", idToDelete)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Gallery Section */}
      <div className="relative rounded-2xl border bg-(--card-bg) p-6 shadow-sm" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <EventGallerySection
          galleries={publicGalleries}
          canManage={canManage}
          onAddGallery={() => openEditor("gallery")}
          onEditGallery={(item) => {
            const galleryItem = galleries.find((g) => g.galleryId === item.galleryId);
            if (galleryItem) openEditor("gallery", galleryItem);
          }}
          onDeleteGallery={(galleryId) => deleteRelation("gallery", galleryId)}
        />
      </div>

      {/* Modals */}
      {editor && (
        <RelationEditorModal
          editor={editor}
          sponsorOptions={sponsorOptions}
          busy={busy}
          error={error}
          onClose={() => !busy && setEditor(null)}
          onSubmit={saveRelation}
        />
      )}

      {galleryCropSource && (
        <GalleryCropModal
          imageSource={galleryCropSource}
          crop={galleryCrop}
          zoom={galleryZoom}
          cropPixels={galleryCropPixels}
          onCropChange={setGalleryCrop}
          onZoomChange={setGalleryZoom}
          onCropComplete={setGalleryCropPixels}
          onCancel={cancelGalleryCrop}
          onApply={applyGalleryCrop}
        />
      )}

      {error && !editor && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}