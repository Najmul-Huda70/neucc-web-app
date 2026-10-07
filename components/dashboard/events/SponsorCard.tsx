// components/dashboard/events/SponsorCard.tsx
"use client";

import Image from "next/image";
import { Edit3, ExternalLink, Mail, Phone, Trash2, User } from "lucide-react";

export type SponsorRelation = {
  id: string;
  tier?: string | null;
  isPublic: boolean;
  comment?: string | null;
  sponsor: {
    sponsorId: string;
    name: string;
    logoUrl?: string | null;
    website?: string | null;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
  };
};

type SponsorCardProps = {
  item: SponsorRelation;
  canManage: boolean;
  onEdit: (item: SponsorRelation) => void;
  onDelete: (id: string) => void;
};

export default function SponsorCard({ item, canManage, onEdit, onDelete }: SponsorCardProps) {
  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl border bg-(--stat-card-bg) p-5 shadow-xs transition hover:shadow-md"
      style={{ borderColor: "var(--btn-secondary-border)" }}
    >
      {/* Edit & Delete Action Buttons */}
      {canManage && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit Sponsor"
            aria-label="Edit Sponsor"
            className="rounded-lg border bg-(--card-bg) p-1.5 text-(--text-secondary) shadow-2xs transition hover:border-(--btn-primary-bg) hover:text-(--text-primary)"
            style={{ borderColor: "var(--btn-secondary-border)" }}
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Delete Sponsor"
            aria-label="Delete Sponsor"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-600 shadow-2xs transition hover:bg-red-500/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Tier Badge */}
      <div className="flex justify-center">
        <span
          className="rounded-full border bg-(--card-bg) px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-(--btn-primary-bg)"
          style={{ borderColor: "var(--btn-secondary-border)" }}
        >
          {item.tier || "Partner"}
        </span>
      </div>

      {/* Logo Area */}
      <div
        className="my-4 flex h-20 items-center justify-center rounded-xl border bg-(--card-bg) p-3"
        style={{ borderColor: "var(--btn-secondary-border)" }}
      >
        {item.sponsor.logoUrl ? (
          <Image
            src={item.sponsor.logoUrl}
            alt={item.sponsor.name}
            width={140}
            height={50}
            unoptimized
            className="max-h-14 w-auto object-contain"
          />
        ) : (
          <span className="text-xs font-semibold text-(--text-secondary)">No Logo Uploaded</span>
        )}
      </div>

      {/* Company Name & Website */}
      <div className="space-y-1.5 text-center">
        <h3 className="line-clamp-1 text-base font-bold text-(--text-primary)">{item.sponsor.name}</h3>
        {item.sponsor.website ? (
          <a
            href={item.sponsor.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-(--text-secondary) hover:text-(--btn-primary-bg) hover:underline"
          >
            <ExternalLink size={12} />
            <span className="max-w-[200px] truncate">{item.sponsor.website}</span>
          </a>
        ) : (
          <p className="text-xs text-(--text-secondary)">No website link</p>
        )}
      </div>

      {/* Contact Person, Email & Phone */}
      <div
        className="mt-5 space-y-1.5 border-t pt-4 text-xs text-(--text-secondary)"
        style={{ borderColor: "var(--btn-secondary-border)" }}
      >
        <p className="flex items-center gap-2 truncate font-medium">
          <User size={13} className="shrink-0 text-(--btn-primary-bg)" />
          <span>
            Contact: <strong className="text-(--text-primary)">{item.sponsor.contactPerson || "N/A"}</strong>
          </span>
        </p>
        <p className="flex items-center gap-2 truncate font-medium">
          <Mail size={13} className="shrink-0 text-(--btn-primary-bg)" />
          <span>
            Email: <strong className="text-(--text-primary)">{item.sponsor.email || "N/A"}</strong>
          </span>
        </p>
        <p className="flex items-center gap-2 truncate font-medium">
          <Phone size={13} className="shrink-0 text-(--btn-primary-bg)" />
          <span>
            Phone: <strong className="text-(--text-primary)">{item.sponsor.phone || "N/A"}</strong>
          </span>
        </p>
      </div>
    </div>
  );
}