import HeroSlider from "@/components/public/home/hero";
import JoinCTA from "@/components/public/home/joinCTA";
import Stats from "@/components/public/home/stats";
import WhatWeDo from "@/components/public/home/whatWeDo";
import LeadershipMessages from "@/components/public/home/leadershipMessages";
import RecentEvents from "@/components/public/home/recentEvents";
import SponsorsSection from "@/components/public/home/sponsorsSection";
import GallerySection from "@/components/public/home/gallerySection";
import { prisma } from "@/lib/prisma";
import { getHeroGalleryImages, getPublicGalleryImages } from "@/lib/services/gallery";
import { getAllMessages } from "@/lib/services/messages";
import { getPublicEvents } from "@/lib/services/events";
import { getPublicSponsors } from "@/lib/services/sponsors";
import type { Metadata } from "next";
import ExecutivesSection from "@/components/public/home/executivesSection";

export const metadata: Metadata = {
  title: "NEU Computer Club | Department of CSE",
  description:
    "Official website of NEU Computer Club (NEUCC), Department of CSE, North East University Bangladesh. Explore our events, workshops, galleries, and executive committees.",
  openGraph: {
    title: "NEU Computer Club | Department of CSE",
    description:
      "Official website of NEU Computer Club (NEUCC), Department of CSE, North East University Bangladesh.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEU Computer Club | Department of CSE",
    description:
      "Official website of NEU Computer Club (NEUCC), Department of CSE, North East University Bangladesh.",
  },
};

export default async function Home() {
  const heroImages = await getHeroGalleryImages();

  // Optimized Parallel Data Fetching
  const [
    members,
    eventsHosted,
    firstCommittee,
    sponsorsCount,
    messages,
    publicEventsData,
    sponsorsList,
    galleryImages,
  ] = await Promise.all([
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.events.count({
      where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    }),
    prisma.committee.aggregate({ _min: { year: true } }),
    prisma.sponsor.count({
      where: { eventSponsors: { some: { isPublic: true } } },
    }),
    getAllMessages(),
    getPublicEvents({ page: 1, pageSize: 6 }),
    getPublicSponsors(),
    getPublicGalleryImages(), // Fetching gallery images in parallel
  ]);

  const firstYear = firstCommittee._min.year ?? new Date().getFullYear();
  const yearsActive = Math.max(1, new Date().getFullYear() - firstYear + 1);

  return (
    <main>
      <HeroSlider initialSlides={heroImages} />
      <WhatWeDo />
      <Stats
        members={members}
        eventsHosted={eventsHosted}
        yearsActive={yearsActive}
        sponsors={sponsorsCount}
      />
      <LeadershipMessages messages={messages} />
      <RecentEvents events={publicEventsData.items} />
      <GallerySection images={galleryImages} />
       <SponsorsSection sponsors={sponsorsList} />
        <ExecutivesSection />
      <JoinCTA />
    </main>
  );
}