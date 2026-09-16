import Image from 'next/image';
import type { Sponsor, SponsorTier } from '@/types/types';

const TIER_STYLES: Record<SponsorTier, string> = {
  PLATINUM: 'text-text-main',
  GOLD: 'text-primary',
  SILVER: 'text-text-muted',
};

export function SponsorTierGroup({
  tier,
  sponsors,
}: {
  tier: SponsorTier;
  sponsors: Sponsor[];
}) {
  if (sponsors.length === 0) return null;

  return (
    <div className="mt-14 first:mt-0">
      <h2 className={`text-center font-heading text-2xl font-bold sm:text-3xl ${TIER_STYLES[tier]}`}>
        {tier} Sponsors
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="rounded-2xl border border-border bg-surface p-6">
            <div className="relative h-16 w-full">
              {sponsor.logo ? <Image src={sponsor.logo} alt={sponsor.name} fill sizes="300px" className="rounded-md object-cover" /> : <span className="text-2xl font-semibold text-primary">{sponsor.name.charAt(0)}</span>}
            </div>
            <h3 className="mt-4 font-heading font-semibold text-text-main">
              {sponsor.name}
            </h3>
            <p className="mt-2 text-sm text-text-muted">{sponsor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
