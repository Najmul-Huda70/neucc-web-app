import type { Metadata } from "next";
import ContactSponsorship from "@/components/public/sponsors/ContactSponsorship";
import SponsorsHero from "@/components/public/sponsors/SponsorsHero";
import SponsorshipTiers from "@/components/public/sponsors/SponsorshipTiers";
import WhySponsorUs from "@/components/public/sponsors/Whypartnersection";
import { prisma } from "@/lib/prisma";
import { buildTieredSponsors } from "@/lib/sponsor-tier";
import { getPublicSponsors } from "@/lib/services/sponsors";

// Dynamic SEO Metadata
export const metadata: Metadata = {
  title: "Sponsor Us | NEU Computer Club",
  description:
    "Partner with North East University Bangladesh CSE Dept. Computer Club. Empower workshops, hackathons, and contests while engaging with top tech talent.",
  keywords: [
    "NEU Computer Club",
    "Sponsorship",
    "North East University Bangladesh",
    "CSE Department",
    "Sponsor Tech Events",
    "Hackathon Sponsors Bangladesh",
    "Sponsorship Tiers",
  ],
  openGraph: {
    title: "Sponsor Us | NEU Computer Club",
    description:
      "Partner with North East University Bangladesh CSE Dept. Computer Club to sponsor workshops, contests, and tech events that empower future software engineers.",
    url: "https://neu.ac.bd/sponsors",
    siteName: "NEU Computer Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor Us | NEU Computer Club",
    description:
      "Partner with NEU CSE Dept. Computer Club to empower the next generation of software engineers.",
  },
};

export default async function PublicSponsorsPage() {
  // Unnecessary eventsHosted count query remove kore sudhu dorkari data rakha holo
  const [distinctEvents, sponsorRows] = await Promise.all([
    // Unique event types
    prisma.events.findMany({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      select: { type: true },
      distinct: ["type"],
    }),

    // Fetching sponsors via public service helper
    getPublicSponsors(),
  ]);

  const eventTypes = distinctEvents.map((e) => e.type);
  const sponsors = buildTieredSponsors(sponsorRows);

  return (
    <main className="min-h-screen bg-(--bg-app) text-(--text-primary)">
      {/* Hero section */}
      <SponsorsHero eventTypes={eventTypes} sponsors={sponsors.slice(0, 20)} />

      {/* Main Page Content Flow */}
      <div className="mx-auto max-w-7xl space-y-24 px-6 py-16">
        {/* Why Partner / Sponsor Us */}
        <section id="why-sponsor-us" className="scroll-mt-24">
          <WhySponsorUs />
        </section>

        {/* Sponsorship Tiers Section */}
        <section id="become-sponsor" className="scroll-mt-24">
          <SponsorshipTiers />
        </section>

        {/* Direct Contact Section */}
        <section id="contact-us" className="scroll-mt-24">
          <ContactSponsorship />
        </section>
      </div>
    </main>
  );
}