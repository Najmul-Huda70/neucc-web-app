import Link from "next/link";
import Image from "next/image";
import { Handshake, ArrowRight } from "lucide-react";

export interface SponsorItem {
  sponsorId: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  _count?: {
    eventSponsors: number;
  };
}

interface SponsorsSectionProps {
  sponsors: SponsorItem[];
}

export default function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  // Filter out sponsors with 0 sponsored events
  const activeSponsors = sponsors.filter(
    (sponsor) => sponsor._count && sponsor._count.eventSponsors > 0
  );

  if (!activeSponsors || activeSponsors.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-(--bg-app) overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-(--text-primary) tracking-tight">
            Our Sponsors & Partners
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-(--text-muted) font-medium">
            Proudly supported by visionary organizations empowering our tech community
          </p>
        </div>

        {/* Dynamic Horizontal Scroll Wrapper with Fixed Card Sizes */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center min-w-full w-max mx-auto gap-4 sm:gap-6 py-2">
            {activeSponsors.map((sponsor) => (
              <div
                key={sponsor.sponsorId}
                className="group flex-shrink-0 w-48 h-36 flex flex-col items-center justify-center p-4 rounded-2xl border border-(--btn-secondary-border) bg-(--card-bg) shadow-xs hover:shadow-md transition-all duration-200 text-center"
              >
                {/* Fixed Image Container */}
                <div className="relative h-14 w-full flex items-center justify-center mb-2">
                  {sponsor.logoUrl ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      fill
                      unoptimized
                      className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <Handshake className="w-8 h-8 text-(--text-muted)" />
                  )}
                </div>

                {/* Company Name with Link */}
                {sponsor.website ? (
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-(--text-primary) line-clamp-1 hover:text-(--btn-primary-bg) hover:underline transition-colors"
                  >
                    {sponsor.name}
                  </a>
                ) : (
                  <h3 className="text-xs font-bold text-(--text-primary) line-clamp-1">
                    {sponsor.name}
                  </h3>
                )}

                {/* Event Count Info */}
                <p className="text-[10px] font-medium text-(--text-muted) mt-1">
                  {sponsor._count?.eventSponsors}{" "}
                  {sponsor._count?.eventSponsors === 1
                    ? "Event Sponsored"
                    : "Events Sponsored"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Redirect CTA to Sponsor/Partner Page */}
        <div className="flex justify-center pt-2">
          <Link
            href="/sponsors#become-sponsor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-(--btn-primary-bg) text-(--btn-primary-text) font-semibold text-sm shadow-sm hover:opacity-90 transition-all"
          >
            <span>Become a Sponsor</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}