import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import  { SponsorCard, SponsorItem } from "@/components/ui/card";

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

        {/* Horizontal Scroll Wrapper using Reusable SponsorCards */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center min-w-full w-max mx-auto gap-4 sm:gap-6 py-2">
            {activeSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.sponsorId} sponsor={sponsor} />
            ))}
          </div>
        </div>

        {/* CTA to Sponsor Page using Universal Button Component */}
        <div className="flex justify-center pt-2">
          <Button
            href="/sponsors#become-sponsor"
            variant="primary"
            size="md"
            className="gap-2"
          >
            <span>Become a Sponsor</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}