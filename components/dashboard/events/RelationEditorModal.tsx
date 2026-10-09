// components/dashboard/events/RelationEditorModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SponsorRelation } from "./SponsorCard";

export type GalleryRelation = {
  galleryId: string;
  imageUrl: string;
  caption?: string | null;
  location?: string | null;
  date?: string | null;
  isPublic: boolean;
  isHero: boolean;
};

export type SponsorOption = {
  sponsorId: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
};

type RelationKind = "sponsor" | "gallery";

const sponsorTiers = ["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

type RelationEditorModalProps = {
  editor: { kind: RelationKind; item?: SponsorRelation | GalleryRelation };
  sponsorOptions: SponsorOption[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function RelationEditorModal({
  editor,
  sponsorOptions,
  busy,
  error,
  onClose,
  onSubmit,
}: RelationEditorModalProps) {
  const sponsor = editor.kind === "sponsor" ? (editor.item as SponsorRelation | undefined) : undefined;
  const gallery = editor.kind === "gallery" ? (editor.item as GalleryRelation | undefined) : undefined;
  const [selectedSponsorId, setSelectedSponsorId] = useState(sponsor?.sponsor.sponsorId || "");
  const selectedSponsor = sponsorOptions.find((option) => option.sponsorId === selectedSponsorId);
  const company = selectedSponsor || sponsor?.sponsor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg space-y-4 rounded-2xl border bg-(--card-bg) p-5 shadow-2xl"
        style={{ borderColor: "var(--btn-secondary-border)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-(--text-primary)">
            {editor.item ? "Update" : "Add"} {editor.kind === "sponsor" ? "sponsor" : "gallery image"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close relation editor">
            <X size={18} />
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-700">{error}</p>}

        {editor.kind === "sponsor" && (
          <div className="space-y-4">
            <SelectField
              label="Company"
              name="sponsorId"
              options={sponsorOptions.map((option) => option.sponsorId)}
              labels={Object.fromEntries(sponsorOptions.map((option) => [option.sponsorId, option.name]))}
              value={selectedSponsorId}
              onChange={(e) => setSelectedSponsorId(e.target.value)}
            />
            <Field label="Company name" name="name" required={!selectedSponsorId} defaultValue={company?.name || ""} />
            <Field label="Contact person" name="contactPerson" defaultValue={company?.contactPerson || ""} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" defaultValue={company?.email || ""} />
              <Field label="Phone" name="phone" type="tel" defaultValue={company?.phone || ""} />
            </div>
            <Field label="Website" name="website" type="url" defaultValue={company?.website || ""} />
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-(--text-primary)">
                Sponsor logo
                <input
                  name="logo"
                  type="file"
                  accept="image/*"
                  className="event-input file:mr-2 file:rounded-md file:border-0 file:bg-(--stat-card-bg) file:px-2 file:py-1 file:text-xs"
                />
              </label>
              <SelectField label="Tier" name="tier" options={sponsorTiers} defaultValue={sponsor?.tier || ""} />
            </div>
            <Field label="Comment" name="comment" defaultValue={sponsor?.comment || ""} />
            <Checkbox label="Public sponsor" name="isPublic" defaultChecked={sponsor?.isPublic ?? true} />
          </div>
        )}

        {editor.kind === "gallery" && (
          <>
            <Field label="Caption" name="caption" defaultValue={gallery?.caption || ""} />
            <Field label="Location" name="location" defaultValue={gallery?.location || ""} />
            <Field
              label="Date"
              name="date"
              type="date"
              defaultValue={gallery?.date ? new Date(gallery.date).toISOString().slice(0, 10) : ""}
            />
            <label className="block text-xs font-semibold text-(--text-primary)">
              Image
              <input
                required={!gallery}
                name="image"
                type="file"
                accept="image/*"
                className="event-input file:mr-2 file:rounded-md file:border-0 file:bg-(--stat-card-bg) file:px-2 file:py-1 file:text-xs"
              />
            </label>
            <Checkbox label="Public image" name="isPublic" defaultChecked={gallery?.isPublic ?? true} />
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "var(--btn-secondary-border)" }}
          >
            Cancel
          </button>
          <button disabled={busy} className="rounded-lg bg-(--btn-primary-bg) px-4 py-2 text-xs font-bold text-(--btn-primary-text)">
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-(--text-primary)">
      {label}
      <input required={required} name={name} type={type} defaultValue={defaultValue} className="event-input" />
    </label>
  );
}

function SelectField({ label, name, options, labels, defaultValue, value, onChange }: { label: string; name: string; options: string[]; labels?: Record<string, string>; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <label className="block text-xs font-semibold text-(--text-primary)">
      {label}
      <select name={name} value={value} onChange={onChange} defaultValue={value === undefined ? defaultValue : undefined} className="event-input">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>{labels?.[option] || option}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="accent-(--btn-primary-bg)" />
      {label}
    </label>
  );
}