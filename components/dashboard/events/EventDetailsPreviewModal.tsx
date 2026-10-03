"use client";

import { X } from "lucide-react";

export default function EventDetailsPreviewModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border bg-(--card-bg) shadow-2xl" style={{ borderColor: "var(--btn-secondary-border)" }}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--btn-secondary-border)" }}>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-(--btn-primary-bg)">Preview</p><h2 className="text-sm font-bold text-(--text-primary)">Public event details</h2></div>
          <button type="button" onClick={onClose} aria-label="Close event preview" className="rounded-lg p-2 text-(--text-secondary) hover:bg-(--stat-card-bg)"><X size={18} /></button>
        </div>
        <iframe title="Public event details preview" src={`/events/${slug}`} className="min-h-0 flex-1 bg-(--bg-app)" />
      </div>
    </div>
  );
}
