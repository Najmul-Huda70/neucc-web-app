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
    <aside className="self-start border-t border-[#d9d5cc] pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pl-7">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">
          At a glance
        </p>

        {canManage && (
          <button
            type="button"
            onClick={onEditDetails}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7a817b] transition hover:text-[#202522]"
          >
            <Edit2 size={13} />
            <span>Edit Info</span>
          </button>
        )}
      </div>

      <dl className="mt-5 divide-y divide-[#e4e0d7] border-y border-[#e4e0d7]">
        <div className="py-4">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">
            Event type
          </dt>
          <dd className="mt-1 text-sm font-bold">{type}</dd>
        </div>

        <div className="py-4">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">
            Committee
          </dt>
          <dd className="mt-1 text-sm font-bold">
            {committee?.type}
            <span className="font-normal text-[#7a817b]">
              {" "}
              · {committee?.year}
            </span>
          </dd>
        </div>

        {status && (
          <div className="py-4">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">
              Status
            </dt>
            <dd className="mt-1 inline-flex items-center gap-2 text-sm font-bold">
              <span className="h-2 w-2 rounded-full bg-[#288c83]" />
              {status}
            </dd>
          </div>
        )}

        {formattedDate && (
          <div className="py-4">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">
              Date
            </dt>
            <dd className="mt-1 text-sm font-bold">{formattedDate}</dd>
          </div>
        )}

        {venue && (
          <div className="py-4">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">
              Venue
            </dt>
            <dd className="mt-1 text-sm font-bold">{venue}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}