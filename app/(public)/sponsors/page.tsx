import ContactSponsorship from "@/components/public/sponsors/ContactSponsorship";
import SponsorsHero from "@/components/public/sponsors/SponsorsHero";
import WhySponsorUs from "@/components/public/sponsors/Whypartnersection";
import { prisma } from "@/lib/prisma";
import { buildTieredSponsors } from "@/lib/sponsor-tier";

// Not stored in the DB, so edit this number by hand.
const STUDENTS_REACHED = "5000+";

export default async function PublicSponsorsPage() {
  // Everything the page needs is fetched once, here, then passed down as props.
  const [distinctEvents, eventsHosted, sponsorRows] = await Promise.all([
    // Unique event types (used in the hero subtitle and the "event formats" stat)
    prisma.events.findMany({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      select: { type: true },
      distinct: ["type"],
    }),

    // Events the club has hosted or is hosting
    prisma.events.count({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    }),

    // Sponsors with at least one confirmed (public) sponsorship on a public event
    prisma.sponsor.findMany({
      where: {
        eventSponsors: {
          some: {
            isPublic: true,
            event: { status: { in: ["PUBLISHED", "COMPLETED"] } },
          },
        },
      },
      select: {
        sponsorId: true,
        name: true,
        logoUrl: true,
        website: true,
        eventSponsors: {
          where: {
            isPublic: true,
            event: { status: { in: ["PUBLISHED", "COMPLETED"] } },
          },
          select: {
            tier: true,
            displayOrder: true,
            event: { select: { title: true, slug: true } },
          },
          orderBy: { event: { startDate: "desc" } },
        },
      },
    }),
  ]);

  const eventTypes = distinctEvents.map((e) => e.type);
  const sponsors = buildTieredSponsors(sponsorRows);

  return (
    <main className="min-h-screen bg-(--bg-app) text-(--text-primary)">
      {/* Simple hero section */}
      <SponsorsHero eventTypes={eventTypes} sponsors={sponsors.slice(0, 20)} />

      {/* Normal sections: they simply follow the hero in the page flow */}
      <div>
        <div className="mx-auto max-w-7xl space-y-24 px-6 py-16">
          
          {/* Why Sponsor Us Section */}
          <section id="why-sponsor-us">
            <WhySponsorUs />
            <ContactSponsorship />
          </section>

          {/* Become a Sponsor Form / Lead Gen Section */}
          <section id="become-sponsor" className="scroll-mt-20">
            {/* Become a Sponsor Form / Content */}
          </section>

        </div>
      </div>
    </main>
  );
}