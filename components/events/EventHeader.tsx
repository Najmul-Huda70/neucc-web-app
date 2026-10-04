import { ArrowDown } from "lucide-react";
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

type EventHeaderProps = EventHeaderData & { actions?: ReactNode; variant?: "default" | "editorial" };

export default function EventHeader({ title, shortDescription, type, status, detailBannerUrl, committee, actions, variant = "default" }: EventHeaderProps) {
  if (variant === "editorial") {
    return (
      <header className="relative isolate min-h-[32rem] overflow-hidden bg-[#172b28] text-white sm:min-h-[38rem]">
        {detailBannerUrl ? <Image src={detailBannerUrl} alt="" fill unoptimized sizes="100vw" className="absolute inset-0 -z-20 object-cover opacity-75" priority /> : <div className="absolute inset-0 -z-20 bg-[#20332f]" />}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,25,22,0.92)_0%,rgba(10,25,22,0.68)_42%,rgba(10,25,22,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-[#10211e]/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[30rem] max-w-7xl items-end px-4 py-8 sm:min-h-[38rem] sm:px-10 sm:py-14 lg:px-16">
          <div className="w-full max-w-5xl">
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/20 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8cda6] sm:items-center sm:gap-5 sm:text-xs">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
              <span className="break-words">{type}</span>
              <span className="h-1 w-1 rounded-full bg-[#e8cda6]" />
              <span className="break-words">{committee.type} Committee · {committee.year}</span>
              </div>
              <span className="hidden text-white/60 sm:block">NEUCC / Event</span>
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-[clamp(2.5rem,10vw,4rem)] font-black leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-8xl">{title}</h1>
                {shortDescription && <p className="mt-6 max-w-2xl text-sm leading-6 text-white/75 sm:mt-7 sm:text-lg sm:leading-7">{shortDescription}</p>}
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-4 text-xs text-white/65 lg:block lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                {status && <span className="inline-flex rounded-full border border-[#e8cda6]/50 bg-[#e8cda6]/10 px-3 py-1 font-bold uppercase tracking-[0.16em] text-[#f1d8b4]">{status}</span>}
                <span className="flex items-center gap-2 lg:mt-8"><ArrowDown size={15} /> Explore details</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {detailBannerUrl && <div className="relative aspect-[3.33/1] w-full bg-(--stat-card-bg)"><Image src={detailBannerUrl} alt={title} fill unoptimized sizes="(max-width: 640px) 100vw, 1024px" className="object-cover" priority /></div>}
      <div className="bg-(--card-bg) px-6 py-2 sm:px-10 sm:py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-(--btn-primary-bg)">{type}</span>
          <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
          <span className="text-sm font-bold text-gray-700">{committee.type} Committee - {committee.year}</span>
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
      </div>
    </>
  );
}
