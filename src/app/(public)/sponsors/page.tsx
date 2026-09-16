export const metadata = { title: 'Sponsors & Partners', description: 'Meet the sponsors and partners supporting NEUCC.' };

import { Mail } from 'lucide-react';
import { sponsors } from '@/data/sponsors';
import { SponsorTierGroup } from '@/components/sections/sponsors/SponsorTierGroup';
import type { SponsorTier } from '@/types/types';

const TIERS: SponsorTier[] = ['Platinum', 'Gold', 'Silver'];

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-text-main sm:text-4xl">
          Sponsors &amp; Partners
        </h1>
        <p className="mt-3 text-text-muted">
          NEUCC is grateful for the support of the organizations that make
          our events and programs possible.
        </p>
      </div>

      {TIERS.map((tier) => (
        <SponsorTierGroup
          key={tier}
          tier={tier}
          sponsors={sponsors.filter((sponsor) => sponsor.tier === tier)}
        />
      ))}

      <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl bg-primary px-8 py-14 text-center">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Become a Sponsor
        </h2>
        <p className="max-w-xl text-sm text-white/90">
          Partner with NEUCC to support the next generation of programmers,
          researchers, and innovators. Reach out to discuss sponsorship
          opportunities.
        </p>
        <a
          href="mailto:neucc@netrokona.university.edu"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
        >
          <Mail size={16} />
          Contact Us to Sponsor
        </a>
      </div>
    </div>
  );
}
