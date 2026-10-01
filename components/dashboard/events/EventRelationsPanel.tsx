"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";
import { Edit3, ImagePlus, Link2, Plus, Trash2, Users, X } from "lucide-react";

type SponsorRelation = { id: string; tier?: string | null; isPublic: boolean; comment?: string | null; sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null } };
type ResourceRelation = { resourceId: string; type: string; title: string; url: string; status: string; startDate?: string | null; endDate?: string | null };
type GalleryRelation = { galleryId: string; imageUrl: string; caption?: string | null; location?: string | null; date?: string | null; isPublic: boolean };

type RelationManagerProps = { eventId: string; eventSponsors: SponsorRelation[]; eventResources: ResourceRelation[]; galleries: GalleryRelation[]; canManage: boolean; onChanged: () => void };
type RelationKind = "sponsor" | "resource" | "gallery";

const resourceTypes = ["REGISTRATION", "MEETING", "RULES", "SLIDES", "RECORDING", "OTHER"];
const resourceStatuses = ["ACTIVE", "DEACTIVATED", "CLOSED"];
const sponsorTiers = ["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

function dateValue(value?: string | null) { return value ? new Date(value).toISOString().slice(0, 10) : ""; }

export default function EventRelationsPanel({ eventId, eventSponsors, eventResources, galleries, canManage, onChanged }: RelationManagerProps) {
  const [editor, setEditor] = useState<{ kind: RelationKind; item?: SponsorRelation | ResourceRelation | GalleryRelation } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditor = (kind: RelationKind, item?: SponsorRelation | ResourceRelation | GalleryRelation) => { setError(null); setEditor({ kind, item }); };
  const closeEditor = () => { if (!busy) setEditor(null); };

  const saveRelation = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData(formEvent.currentTarget);
      const payload: Record<string, unknown> = { relation: editor.kind };
      form.forEach((value, key) => { if (key !== "image") payload[key] = value; });
      if (editor.kind === "sponsor") payload.isPublic = form.get("isPublic") === "on";
      if (editor.kind === "gallery") {
        payload.isPublic = form.get("isPublic") === "on";
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
      if (editor.item) payload.relationId = "id" in editor.item ? editor.item.id : "resourceId" in editor.item ? editor.item.resourceId : editor.item.galleryId;
      const response = await fetch(`/api/events/${eventId}/relations`, { method: editor.item ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save relation.");
      setEditor(null);
      onChanged();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save relation."); } finally { setBusy(false); }
  };

  const deleteRelation = async (kind: RelationKind, relationId: string) => {
    if (!window.confirm("Remove this item from the event?")) return;
    const response = await fetch(`/api/events/${eventId}/relations`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ relation: kind, relationId }) });
    if (!response.ok) { const data = await response.json(); setError(data.message || "Unable to delete relation."); return; }
    onChanged();
  };

  return <div className="space-y-5">
    <RelationSection title="Sponsors" icon={<Users size={17} />} canManage={canManage} onAdd={() => openEditor("sponsor")}>
      {eventSponsors.length === 0 ? <EmptyRelation text="No sponsors added yet." /> : <div className="grid gap-3 sm:grid-cols-2">{eventSponsors.map((item) => <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-(--text-primary)">{item.sponsor.name}</p><p className="mt-1 text-[11px] text-(--text-secondary)">{item.tier || "Partner"} · {item.isPublic ? "Public" : "Private"}</p></div>{canManage && <RelationActions onEdit={() => openEditor("sponsor", item)} onDelete={() => deleteRelation("sponsor", item.id)} />}</div>{item.sponsor.website && <a href={item.sponsor.website} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-(--text-secondary) underline">{item.sponsor.website}</a>}</div>)}</div>}
    </RelationSection>
    <RelationSection title="Event resources" icon={<Link2 size={17} />} canManage={canManage} onAdd={() => openEditor("resource")}>
      {eventResources.length === 0 ? <EmptyRelation text="No resources added yet." /> : <div className="space-y-2">{eventResources.map((item) => <div key={item.resourceId} className="flex items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: "var(--btn-secondary-border)" }}><a href={item.url} target="_blank" rel="noreferrer" className="min-w-0"><p className="truncate text-sm font-bold text-(--text-primary)">{item.title}</p><p className="mt-1 text-[11px] text-(--text-secondary)">{item.type} · {item.status}</p></a>{canManage && <RelationActions onEdit={() => openEditor("resource", item)} onDelete={() => deleteRelation("resource", item.resourceId)} />}</div>)}</div>}
    </RelationSection>
    <RelationSection title="Gallery" icon={<ImagePlus size={17} />} canManage={canManage} onAdd={() => openEditor("gallery")}>
      {galleries.length === 0 ? <EmptyRelation text="No gallery images added yet." /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{galleries.map((item) => <div key={item.galleryId} className="group overflow-hidden rounded-xl border" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="relative aspect-video"><Image src={item.imageUrl} alt={item.caption || "Event gallery"} fill unoptimized sizes="(max-width: 640px) 50vw, 300px" className="object-cover" /></div><div className="flex items-center justify-between gap-2 p-2"><p className="truncate text-[11px] text-(--text-secondary)">{item.caption || "Gallery image"}</p>{canManage && <RelationActions onEdit={() => openEditor("gallery", item)} onDelete={() => deleteRelation("gallery", item.galleryId)} />}</div></div>)}</div>}
    </RelationSection>
    {editor && <RelationEditor editor={editor} busy={busy} error={error} onClose={closeEditor} onSubmit={saveRelation} />}
    {error && !editor && <p className="text-xs text-red-700">{error}</p>}
  </div>;
}

function RelationSection({ title, icon, canManage, onAdd, children }: { title: string; icon: ReactNode; canManage: boolean; onAdd: () => void; children: ReactNode }) { return <section className="rounded-2xl border bg-(--card-bg) p-5" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-bold text-(--text-primary)">{icon}{title}</h2>{canManage && <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold text-(--text-secondary) transition hover:bg-(--stat-card-bg)" style={{ borderColor: "var(--btn-secondary-border)" }}><Plus size={13} /> Add</button>}</div>{children}</section>; }
function EmptyRelation({ text }: { text: string }) { return <p className="rounded-xl border border-dashed p-4 text-xs text-(--text-secondary)" style={{ borderColor: "var(--btn-secondary-border)" }}>{text}</p>; }
function RelationActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex shrink-0 gap-1"><button type="button" onClick={onEdit} aria-label="Edit relation" className="rounded-lg p-1.5 text-(--text-secondary) hover:bg-(--stat-card-bg)"><Edit3 size={14} /></button><button type="button" onClick={onDelete} aria-label="Delete relation" className="rounded-lg p-1.5 text-red-600 hover:bg-red-500/10"><Trash2 size={14} /></button></div>; }

function RelationEditor({ editor, busy, error, onClose, onSubmit }: { editor: { kind: RelationKind; item?: SponsorRelation | ResourceRelation | GalleryRelation }; busy: boolean; error: string | null; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const sponsor = editor.kind === "sponsor" ? editor.item as SponsorRelation | undefined : undefined;
  const resource = editor.kind === "resource" ? editor.item as ResourceRelation | undefined : undefined;
  const gallery = editor.kind === "gallery" ? editor.item as GalleryRelation | undefined : undefined;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"><form onSubmit={onSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border bg-(--card-bg) p-5 shadow-2xl" style={{ borderColor: "var(--btn-secondary-border)" }}><div className="flex items-center justify-between"><h3 className="text-base font-bold text-(--text-primary)">{editor.item ? "Update" : "Add"} {editor.kind === "sponsor" ? "sponsor" : editor.kind === "resource" ? "resource" : "gallery image"}</h3><button type="button" onClick={onClose} aria-label="Close relation editor"><X size={18} /></button></div>{error && <p className="rounded-lg bg-red-500/10 p-2 text-xs text-red-700">{error}</p>}
    {editor.kind === "sponsor" && <><Field label="Sponsor name" name="name" required defaultValue={sponsor?.sponsor.name} /><Field label="Website" name="website" type="url" defaultValue={sponsor?.sponsor.website || ""} /><div className="grid grid-cols-2 gap-3"><Field label="Logo URL" name="logoUrl" type="url" defaultValue={sponsor?.sponsor.logoUrl || ""} /><SelectField label="Tier" name="tier" options={sponsorTiers} defaultValue={sponsor?.tier || ""} /></div><Field label="Comment" name="comment" defaultValue={sponsor?.comment || ""} /><Checkbox label="Public sponsor" name="isPublic" defaultChecked={sponsor?.isPublic ?? true} /></>}
    {editor.kind === "resource" && <><Field label="Title" name="title" required defaultValue={resource?.title} /><Field label="URL" name="url" type="url" required defaultValue={resource?.url} /><div className="grid grid-cols-2 gap-3"><SelectField label="Type" name="type" options={resourceTypes} defaultValue={resource?.type} /><SelectField label="Status" name="status" options={resourceStatuses} defaultValue={resource?.status} /></div><div className="grid grid-cols-2 gap-3"><Field label="Start date" name="startDate" type="date" defaultValue={dateValue(resource?.startDate)} /><Field label="End date" name="endDate" type="date" defaultValue={dateValue(resource?.endDate)} /></div></>}
    {editor.kind === "gallery" && <><Field label="Caption" name="caption" defaultValue={gallery?.caption || ""} /><Field label="Location" name="location" defaultValue={gallery?.location || ""} /><Field label="Date" name="date" type="date" defaultValue={dateValue(gallery?.date)} /><label className="block text-xs font-semibold text-(--text-primary)">Image<input required={!gallery} name="image" type="file" accept="image/*" className="event-input file:mr-2 file:rounded-md file:border-0 file:bg-(--stat-card-bg) file:px-2 file:py-1 file:text-xs" /></label><Checkbox label="Public image" name="isPublic" defaultChecked={gallery?.isPublic ?? true} /></>}
    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--btn-secondary-border)" }}>Cancel</button><button disabled={busy} className="rounded-lg bg-(--btn-primary-bg) px-4 py-2 text-xs font-bold text-(--btn-primary-text)">{busy ? "Saving..." : "Save"}</button></div>
  </form></div>;
}

function Field({ label, name, type = "text", defaultValue, required }: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean }) { return <label className="block text-xs font-semibold text-(--text-primary)">{label}<input required={required} name={name} type={type} defaultValue={defaultValue} className="event-input" /></label>; }
function SelectField({ label, name, options, defaultValue }: { label: string; name: string; options: string[]; defaultValue?: string }) { return <label className="block text-xs font-semibold text-(--text-primary)">{label}<select name={name} defaultValue={defaultValue} className="event-input"><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) { return <label className="flex items-center gap-2 text-xs font-semibold text-(--text-primary)"><input name={name} type="checkbox" defaultChecked={defaultChecked} className="accent-(--btn-primary-bg)" />{label}</label>; }
