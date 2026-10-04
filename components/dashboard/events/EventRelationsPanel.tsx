"use client";

import { type ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { Edit3, ImagePlus, Plus, Trash2, Users, X } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";

type SponsorRelation = { id: string; tier?: string | null; isPublic: boolean; comment?: string | null; sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null; contactPerson?: string | null; email?: string | null; phone?: string | null } };
type SponsorOption = { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null; contactPerson?: string | null; email?: string | null; phone?: string | null };
type GalleryRelation = { galleryId: string; imageUrl: string; caption?: string | null; location?: string | null; date?: string | null; isPublic: boolean };

type RelationManagerProps = { eventId: string; eventSponsors: SponsorRelation[]; galleries: GalleryRelation[]; canManage: boolean; onChanged: () => void };
type RelationKind = "sponsor" | "gallery";

const sponsorTiers = ["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

function dateValue(value?: string | null) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }

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
      canvas.toBlob((blob) => blob ? resolve(new File([blob], "gallery-image.jpg", { type: "image/jpeg" })) : reject(new Error("Unable to export the gallery image.")), "image/jpeg", 0.92);
    };
    image.onerror = () => reject(new Error("Unable to read the gallery image."));
    image.src = imageSrc;
  });
}

export default function EventRelationsPanel({ eventId, eventSponsors, galleries, canManage, onChanged }: RelationManagerProps) {
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
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) setSponsorOptions(data.data ?? []);
      })
      .catch(() => undefined);
  }, []);

  const openEditor = (kind: RelationKind, item?: SponsorRelation | GalleryRelation) => { setError(null); setGalleryCropFile(null); setEditor({ kind, item }); };
  const closeEditor = () => { if (!busy) setEditor(null); };

  const saveRelation = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData(formEvent.currentTarget);
      const payload: Record<string, unknown> = { relation: editor.kind };
      form.forEach((value, key) => { if (key !== "image" && key !== "logo") payload[key] = value; });
      if (editor.kind === "sponsor") payload.isPublic = form.get("isPublic") === "on";
      if (editor.kind === "sponsor") {
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
      const response = await fetch(`/api/events/${eventId}/relations`, { method: editor.item ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save relation.");
      setEditor(null);
      setGalleryCropFile(null);
      onChanged();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save relation."); } finally { setBusy(false); }
  };

  const deleteRelation = async (kind: RelationKind, relationId: string) => {
    if (!window.confirm("Remove this item from the event?")) return;
    const response = await fetch(`/api/events/${eventId}/relations`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ relation: kind, relationId }) });
    if (!response.ok) { const data = await response.json(); setError(data.message || "Unable to delete relation."); return; }
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

  return <div className="space-y-5">
    <RelationSection title="Sponsors" icon={<Users size={17} />} canManage={canManage} onAdd={() => openEditor("sponsor")}>
      {eventSponsors.length === 0 ? <EmptyRelation text="No sponsors added yet." /> : <div className="grid gap-3 sm:grid-cols-2">{eventSponsors.map((item) => <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-(--text-primary)">{item.sponsor.name}</p><p className="mt-1 text-[11px] text-(--text-secondary)">{item.tier || "Partner"} · {item.isPublic ? "Public" : "Private"}</p></div>{canManage && <RelationActions onEdit={() => openEditor("sponsor", item)} onDelete={() => deleteRelation("sponsor", item.id)} />}</div>{item.sponsor.website && <a href={item.sponsor.website} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-(--text-secondary) underline">{item.sponsor.website}</a>}</div>)}</div>}
    </RelationSection>
    <RelationSection title="Gallery" icon={<ImagePlus size={17} />} canManage={canManage} onAdd={() => openEditor("gallery")}>
      {galleries.length === 0 ? <EmptyRelation text="No gallery images added yet." /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{galleries.map((item) => <div key={item.galleryId} className="group overflow-hidden rounded-xl border" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="relative aspect-video"><Image src={item.imageUrl} alt={item.caption || "Event gallery"} fill unoptimized sizes="(max-width: 640px) 50vw, 300px" className="object-cover" /></div><div className="flex items-center justify-between gap-2 p-2"><p className="truncate text-[11px] text-(--text-secondary)">{item.caption || "Gallery image"}</p>{canManage && <RelationActions onEdit={() => openEditor("gallery", item)} onDelete={() => deleteRelation("gallery", item.galleryId)} />}</div></div>)}</div>}
    </RelationSection>
    {editor && <RelationEditor editor={editor} sponsorOptions={sponsorOptions} busy={busy} error={error} onClose={closeEditor} onSubmit={saveRelation} />}
    {galleryCropSource && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-2xl border bg-(--card-bg) p-5 shadow-2xl" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-bold text-(--text-primary)">Crop gallery image</h3><p className="mt-1 text-xs text-(--text-secondary)">Adjust the image for the gallery frame.</p></div><button type="button" onClick={cancelGalleryCrop} aria-label="Close gallery crop editor"><X size={18} /></button></div><div className="relative aspect-video overflow-hidden rounded-xl bg-black"><Cropper image={galleryCropSource} crop={galleryCrop} zoom={galleryZoom} aspect={16 / 9} onCropChange={setGalleryCrop} onZoomChange={setGalleryZoom} onCropComplete={(_, pixels) => setGalleryCropPixels(pixels)} showGrid objectFit="contain" /></div><label className="mt-4 block text-xs font-semibold text-(--text-primary)">Zoom<input aria-label="Gallery image zoom" type="range" min={1} max={3} step={0.05} value={galleryZoom} onChange={(event) => setGalleryZoom(Number(event.target.value))} className="mt-2 w-full accent-(--btn-primary-bg)" /></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={cancelGalleryCrop} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--btn-secondary-border)" }}>Cancel</button><button type="button" onClick={applyGalleryCrop} disabled={!galleryCropPixels} className="rounded-lg bg-(--btn-primary-bg) px-4 py-2 text-xs font-bold text-(--btn-primary-text) disabled:opacity-50">Use cropped image</button></div></div></div>}
    {error && !editor && <p className="text-xs text-red-700">{error}</p>}
  </div>;
}

function RelationSection({ title, icon, canManage, onAdd, children }: { title: string; icon: ReactNode; canManage: boolean; onAdd: () => void; children: ReactNode }) { return <section className="rounded-2xl border bg-(--card-bg) p-5" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-bold text-(--text-primary)">{icon}{title}</h2>{canManage && <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold text-(--text-secondary) transition hover:bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}><Plus size={13} /> Add</button>}</div>{children}</section>; }
function EmptyRelation({ text }: { text: string }) { return <p className="rounded-xl border border-dashed p-4 text-xs text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}>{text}</p>; }
function RelationActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex shrink-0 gap-1"><button type="button" onClick={onEdit} aria-label="Edit relation" className="rounded-lg p-1.5 text-(--text-secondary) hover:bg-(--stat-card-bg)"><Edit3 size={14} /></button><button type="button" onClick={onDelete} aria-label="Delete relation" className="rounded-lg p-1.5 text-red-600 hover:bg-red-500/10"><Trash2 size={14} /></button></div>; }

function RelationEditor({ editor, sponsorOptions, busy, error, onClose, onSubmit }: { editor: { kind: RelationKind; item?: SponsorRelation | GalleryRelation }; sponsorOptions: SponsorOption[]; busy: boolean; error: string | null; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const sponsor = editor.kind === "sponsor" ? editor.item as SponsorRelation | undefined : undefined;
  const gallery = editor.kind === "gallery" ? editor.item as GalleryRelation | undefined : undefined;
  const [selectedSponsorId, setSelectedSponsorId] = useState(sponsor?.sponsor.sponsorId || "");
  const selectedSponsor = sponsorOptions.find((option) => option.sponsorId === selectedSponsorId);
  const company = selectedSponsor || sponsor?.sponsor;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"><form onSubmit={onSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border bg-(--card-bg) p-5 shadow-2xl" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="flex items-center justify-between"><h3 className="text-base font-bold text-(--text-primary)">{editor.item ? "Update" : "Add"} {editor.kind === "sponsor" ? "sponsor" : "gallery image"}</h3><button type="button" onClick={onClose} aria-label="Close relation editor"><X size={18} /></button></div>{error && <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-700">{error}</p>}
    {editor.kind === "sponsor" && <div key={`${selectedSponsorId || "new-sponsor"}-${company?.name || ""}-${company?.contactPerson || ""}-${company?.email || ""}-${company?.phone || ""}-${company?.website || ""}`} className="space-y-4"><SelectField label="Company" name="sponsorId" options={sponsorOptions.map((option) => option.sponsorId)} labels={Object.fromEntries(sponsorOptions.map((option) => [option.sponsorId, option.name]))} value={selectedSponsorId} onChange={(event) => setSelectedSponsorId(event.target.value)} /><Field label="Company name" name="name" required={!selectedSponsorId} defaultValue={company?.name || ""} /><Field label="Contact person" name="contactPerson" defaultValue={company?.contactPerson || ""} /><div className="grid gap-3 sm:grid-cols-2"><Field label="Email" name="email" type="email" defaultValue={company?.email || ""} /><Field label="Phone" name="phone" type="tel" defaultValue={company?.phone || ""} /></div><Field label="Website" name="website" type="url" defaultValue={company?.website || ""} /><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-(--text-primary)">Sponsor logo<input name="logo" type="file" accept="image/*" className="event-input file:mr-2 file:rounded-md file:border-0 file:bg-(--stat-card-bg) file:px-2 file:py-1 file:text-xs" /></label><SelectField label="Tier" name="tier" options={sponsorTiers} defaultValue={sponsor?.tier || ""} /></div><Field label="Comment" name="comment" defaultValue={sponsor?.comment || ""} /><Checkbox label="Public sponsor" name="isPublic" defaultChecked={sponsor?.isPublic ?? true} /></div>}
    {editor.kind === "gallery" && <><Field label="Caption" name="caption" defaultValue={gallery?.caption || ""} /><Field label="Location" name="location" defaultValue={gallery?.location || ""} /><Field label="Date" name="date" type="date" defaultValue={dateValue(gallery?.date)} /><label className="block text-xs font-semibold text-(--text-primary)">Image<input required={!gallery} name="image" type="file" accept="image/*" className="event-input file:mr-2 file:rounded-md file:border-0 file:bg-(--stat-card-bg) file:px-2 file:py-1 file:text-xs" /></label><Checkbox label="Public image" name="isPublic" defaultChecked={gallery?.isPublic ?? true} /></>}
    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--btn-secondary-border)" }}>Cancel</button><button disabled={busy} className="rounded-lg bg-(--btn-primary-bg) px-4 py-2 text-xs font-bold text-(--btn-primary-text)">{busy ? "Saving..." : "Save"}</button></div>
  </form></div>;
}

function Field({ label, name, type = "text", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) { return <label className="block text-xs font-semibold text-(--text-primary)">{label}<input required={required} name={name} type={type} defaultValue={defaultValue} className="event-input" /></label>; }
function SelectField({ label, name, options, labels, defaultValue, value, onChange }: { label: string; name: string; options: string[]; labels?: Record<string, string>; defaultValue?: string; value?: string; onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void }) { return <label className="block text-xs font-semibold text-(--text-primary)">{label}<select name={name} value={value} onChange={onChange} defaultValue={value === undefined ? defaultValue : undefined} className="event-input"><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}</select></label>; }
function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) { return <label className="flex items-center gap-2 text-xs font-semibold text-(--text-primary)"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="accent-(--btn-primary-bg)" />{label}</label>; }
