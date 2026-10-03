import Image from "next/image";
import type { ReactNode } from "react";

export type EventHeaderData = {
  title: string;
  shortDescription: string;
  type: string;
  status?: string;
  detailBannerUrl?: string | null;
  committee: { type: string; year: number };
};

type EventHeaderProps = EventHeaderData & { actions?: ReactNode };

export default function EventHeader({ title, shortDescription, type, status, detailBannerUrl, committee, actions }: EventHeaderProps) {
  return (
    <>
      {detailBannerUrl && <div className="relative aspect-[3.33/1] w-full bg-(--stat-card-bg)"><Image src={detailBannerUrl} alt={title} fill unoptimized sizes="(max-width: 640px) 100vw, 1024px" className="object-cover" priority /></div>}
      <div className="bg-(--card-bg) px-6 py-2 sm:px-10 sm:py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-(--btn-primary-bg)">{type}</span>
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
          <span className="text-sm font-bold text-gray-700">{committee.type} Committee - {committee.year}</span>
          {status && <span className="rounded-full bg-(--stat-card-bg) px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)">{status}</span>}
          {actions && <div className="ml-auto">{actions}</div>}
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-(--text-secondary)">{shortDescription}</p>
      </div>
    </>
  );
}
