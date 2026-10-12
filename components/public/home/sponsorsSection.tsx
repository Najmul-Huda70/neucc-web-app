import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { SponsorCard, SponsorItem } from "@/components/ui/card";
import SectionHeader from "@/components/ui/SectionHeader";

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
    <section className="w-full bg-(--bg-app) overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 space-y-12">
        {/* Reusable Section Header */}
        <SectionHeader
          title="Our Sponsors and Partners"
          subtitle="Proudly supported by visionary organizations empowering our tech community"
        />

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
            className="gap-2 cursor-pointer"
          >
            <span>Become a Sponsor</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}