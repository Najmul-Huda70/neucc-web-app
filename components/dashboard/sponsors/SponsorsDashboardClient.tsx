"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Globe, Building2, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import AddSponsorModal from "./AddSponsorModal";

type Sponsor = {
  sponsorId: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  _count?: {
    eventSponsors: number;
  };
};

type Props = {
  initialSponsors: Sponsor[];
};

export default function SponsorsDashboardClient({ initialSponsors }: Props) {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state when initialSponsors updates (e.g. after router.refresh())
  useEffect(() => {
    setSponsors(initialSponsors);
  }, [initialSponsors]);

  // Refresh Server Component after adding a new sponsor
  const handleSuccess = () => {
    router.refresh();
  };

  const filteredSponsors = sponsors.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header, Search & Add Button in Same Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Sponsors Management
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex items-center w-full sm:w-72">
            <Search size={16} className="absolute left-3 text-(--text-muted) pointer-events-none" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) placeholder:text-(--text-muted)/70 shadow-2xs transition-all focus:border-(--btn-primary-bg) focus:outline-none focus:ring-1 focus:ring-(--btn-primary-bg)"
            />
          </div>

          {/* Add Company Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-sm hover:opacity-90 transition active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {filteredSponsors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-color) p-12 text-center my-8">
          <Building2 size={36} className="mx-auto text-(--text-muted) mb-3" />
          <h3 className="text-sm font-semibold text-(--text-primary)">No Companies Found</h3>
          <p className="text-xs text-(--text-secondary) mt-1">
            {searchQuery
              ? "No sponsor matched your search criteria."
              : "Click '+ Add Company' to add your first sponsor partner."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <Link
              key={sponsor.sponsorId}
              href={`/dashboard/sponsors/${sponsor.sponsorId}`}
              className="group flex flex-col rounded-2xl border border-(--border-color) bg-(--card-bg) overflow-hidden shadow-2xs hover:shadow-md hover:border-(--btn-primary-bg) transition-all duration-200"
            >
              {/* Top Container: Responsive Aspect Ratio Logo Container */}
              <div className="relative aspect-video w-full bg-(--stat-card-bg)/30 flex items-center justify-center p-4 border-b border-(--border-color)">
                {sponsor.logoUrl ? (
                  <Image
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-(--text-muted)">
                    <Building2 size={30} />
                    <span className="text-[10px] font-medium tracking-wide">No Logo</span>
                  </div>
                )}

                {/* Event Count Badge (Matching Theme Colors) */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-(--border-color) bg-(--card-bg)/90 px-2.5 py-1 text-[10px] font-semibold text-(--text-primary) backdrop-blur-md shadow-2xs">
                  <CalendarCheck size={12} className="text-(--btn-primary-bg)" />
                  <span>{sponsor._count?.eventSponsors || 0} Events</span>
                </div>
              </div>

              {/* Bottom Container: Details & Link */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-bold text-(--text-primary) group-hover:text-(--btn-primary-bg) transition-colors line-clamp-1">
                    {sponsor.name}
                  </h3>

                  {sponsor.website && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-(--text-secondary)">
                      <Globe size={13} className="shrink-0 text-(--text-muted)" />
                      <span className="truncate">{sponsor.website.replace(/^https?:\/\//, "")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-(--border-color)/60 flex items-center justify-between text-[11px] font-semibold text-(--btn-primary-bg)">
                  <span>View Details & History</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddSponsorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}