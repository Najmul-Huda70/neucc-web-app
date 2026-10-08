"use client";

import Image from "next/image";
import { Edit2 } from "lucide-react";

export type PublicEventSponsor = {
  id: string;
  tier?: string | null;
  sponsor: {
    sponsorId: string;
    name: string;
    logoUrl?: string | null;
    website?: string | null;
  };
};

type EventSponsorsSectionProps = {
  sponsors: PublicEventSponsor[];
  canManage?: boolean;
  onEditSponsors?: () => void;
};

function SponsorTile({ item }: { item: PublicEventSponsor }) {
  const { sponsor } = item;

  const content = (
    <>
      <p className="mb-4 text-xs font-medium text-(--text-muted)">{item.tier || "Partner"}</p>
      <div className="flex h-14 w-full items-center justify-center" title={sponsor.name}>
        {sponsor.logoUrl ? (
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            width={160}
            height={56}
            unoptimized
            className="max-h-12 w-auto max-w-full object-contain"
          />
        ) : (
          <span className="line-clamp-2 text-center text-sm font-semibold text-(--text-secondary)">
            {sponsor.name}
          </span>
        )}
      </div>
    </>
  );

  const base =
    "flex flex-col items-center rounded-xl border border-(--border-color) bg-(--card-bg) p-5 text-center transition hover:border-(--btn-primary-bg)/40 hover:shadow-sm";

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className={base}>
      {content}
    </a>
  ) : (
    <div className={base}>{content}</div>
  );
}

export default function EventSponsorsSection({
  sponsors,
  canManage,
  onEditSponsors,
}: EventSponsorsSectionProps) {
  if (sponsors.length === 0 && !canManage) return null;

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <h2 className="text-xl font-bold tracking-tight text-(--text-primary) sm:text-2xl">
          Supported by
        </h2>

        {canManage && (
          <button
            type="button"
            onClick={onEditSponsors}
            className="flex items-center gap-1.5 rounded-lg border border-(--border-color) bg-(--card-bg) px-3 py-1.5 text-xs font-bold text-(--text-muted) transition hover:bg-(--card-hover) hover:text-(--text-primary)"
          >
            <Edit2 size={13} />
            <span>Edit partners</span>
          </button>
        )}
      </div>

      {sponsors.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {sponsors.map((item) => (
            <SponsorTile key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-(--border-color) py-10 text-center text-sm text-(--text-muted)">
          No partners or sponsors added yet.
        </p>
      )}
    </div>
  );
}