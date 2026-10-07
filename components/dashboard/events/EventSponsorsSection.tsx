"use client";

import Image from "next/image";
import { Edit2, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

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

export default function EventSponsorsSection({
  sponsors,
  canManage,
  onEditSponsors,
}: EventSponsorsSectionProps) {
  if (sponsors.length === 0 && !canManage) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: -15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-5 flex items-center justify-between border-t border-[#d9d5cc] pt-16">
        <div className="flex items-center gap-3">
          <UsersRound size={17} className="text-[#9b744e]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">
              Partners
            </p>
            <h2 className="font-serif text-2xl">Supported by</h2>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onEditSponsors}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7a817b] transition hover:text-[#202522]"
          >
            <Edit2 size={13} />
            <span>Edit Partners</span>
          </button>
        )}
      </div>

      {sponsors.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-center border border-[#e2ded6] bg-[#faf8f3] p-5 transition-colors hover:border-[#b99a73] hover:bg-[#f4eee5]"
            >
              <div className="min-w-0 text-center">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b744e]">
                  {item.tier || "Partner"}
                </p>
                <div
                  className="group relative flex h-16 w-36 items-center justify-center"
                  title={item.sponsor.name}
                >
                  {item.sponsor.logoUrl ? (
                    <Image
                      src={item.sponsor.logoUrl}
                      alt={item.sponsor.name}
                      width={120}
                      height={48}
                      unoptimized
                      className="max-h-12 w-auto max-w-32 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#7a817b]">
                      {item.sponsor.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-[#7a817b]">
          No partners/sponsors added yet.
        </p>
      )}
    </motion.section>
  );
}