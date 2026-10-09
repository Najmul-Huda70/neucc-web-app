"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";

import EventGallerySection from "./EventGallerySection";
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
        payload.isHero = form.get("isHero") === "on"; // <-- 1. Modal submit e isHero pass kora hoyeche
        const image = form.get("image");
        if (image instanceof File && image.size > 0) {
          const uploadBody = new FormData();
          uploadBody.append("file", image);
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
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save relation.");
    } finally {
      setBusy(false);
    }
  };

  // Direct Modal Save Action for EditorialGallery (Title, Venue, Date, Public, Hero & Cropped Image)
  const handleSaveGallery = async (data: {
    galleryId?: string;
    caption: string;
    location: string;
    date: string;
    isPublic?: boolean;  // <-- 2. Receive isPublic
    isHero?: boolean;    // <-- 2. Receive isHero
    croppedImageFile?: File | null;
  }) => {
    let imageUrl: string | undefined;

    // 1. If cropped image exists, upload to API
    if (data.croppedImageFile) {
      const uploadBody = new FormData();
      uploadBody.append("file", data.croppedImageFile);
      const uploadResponse = await fetch("/api/uploads", { method: "POST", body: uploadBody });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.message || "Image upload failed.");
      imageUrl = uploadData.data.url;
    }

    // 2. Patch or Post the relation with isPublic and isHero
    const response = await fetch(`/api/events/${eventId}/relations`, {
      method: data.galleryId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relation: "gallery",
        relationId: data.galleryId,
        caption: data.caption,
        location: data.location,
        date: data.date,
        isPublic: data.isPublic, // <-- Pass to API Payload
        isHero: data.isHero,     // <-- Pass to API Payload
        ...(imageUrl && { imageUrl }),
      }),
    });

    const resData = await response.json();
    if (!response.ok) throw new Error(resData.message || "Failed to update gallery image.");

    onChanged();
  };

  const deleteRelation = async (kind: RelationKind, relationId: string) => {
    const response = await fetch(`/api/events/${eventId}/relations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relation: kind, relationId }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.message || "Unable to delete relation.");
      throw new Error(data.message);
    }
    onChanged();
  };

  // 3. Mapping-e isPublic & isHero include kora hocche jate EditorialGallery component e thikmoto value jay
  const publicGalleries = galleries.map((g) => ({
    galleryId: g.galleryId,
    imageUrl: g.imageUrl,
    caption: g.caption,
    location: g.location,
    date: g.date ? String(g.date) : null,
    isPublic: g.isPublic, // <-- Pass to EditorialGallery
    isHero: g.isHero,     // <-- Pass to EditorialGallery
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
          onSaveGallery={handleSaveGallery}
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

      {error && !editor && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}