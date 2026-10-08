"use client";

import { Edit2 } from "lucide-react";

type EventAtAGlanceProps = {
  type: string;
  committee: { type: string; year: number };
  status?: string | null;
  formattedDate?: string | null;
  venue?: string | null;
  canManage?: boolean;
  onEditDetails?: () => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium text-(--text-muted)">{label}</dt>
      <dd className="text-sm font-semibold text-(--text-primary)">{children}</dd>
    </div>
  );
}

export default function EventAtAGlance({
  type,
  committee,
  status,
  formattedDate,
  venue,
  canManage,
  onEditDetails,
}: EventAtAGlanceProps) {
  return (
    <aside className="self-start rounded-2xl border border-(--border-color) bg-(--card-bg) p-5 sm:p-6 lg:sticky lg:top-24">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-(--border-color) pb-4">
        <h2 className="text-base font-bold tracking-tight text-(--text-primary)">At a glance</h2>

        {canManage && (
          <button
            type="button"
            onClick={onEditDetails}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-(--text-muted) transition hover:bg-(--card-hover) hover:text-(--text-primary)"
          >
            <Edit2 size={13} />
            <span>Edit info</span>
          </button>
        )}
      </div>

      <dl className="divide-y divide-(--border-color)">
        <Row label="Event type">{type}</Row>

        <Row label="Committee">
          {committee?.type}
          <span className="font-normal text-(--text-muted)"> · {committee?.year}</span>
        </Row>

     

        {formattedDate && <Row label="Date">{formattedDate}</Row>}
        {venue && <Row label="Venue">{venue}</Row>}
      </dl>
    </aside>
  );
}