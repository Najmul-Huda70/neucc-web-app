import HeroSlider from "@/components/public/home/hero";
import JoinCTA from "@/components/public/home/joinCTA";
import WhatWeDo from "@/components/public/home/whatWeDo";
import LeadershipMessages from "@/components/public/home/leadershipMessages";
import RecentEvents from "@/components/public/home/recentEvents";
import SponsorsSection from "@/components/public/home/sponsorsSection";
import GallerySection from "@/components/public/home/gallerySection";
import StatsSection from "@/components/public/home/stats";
import ExecutivesSection from "@/components/public/home/executivesSection";

import { getHeroGalleryImages, getPublicGalleryImages } from "@/lib/services/gallery";
import { getAllMessages } from "@/lib/services/messages";
import { getPublicEvents } from "@/lib/services/events";
import { getPublicSponsors } from "@/lib/services/sponsors";
import { getCachedHomeStats } from "@/lib/services/stats";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "NEU Computer Club | Department of CSE",
  description:
    "Official website of NEU Computer Club (NEUCC), Department of CSE, North East University Bangladesh. Explore our events, workshops, galleries, and executive committees.",
};

export default async function Home() {
  const [
    heroImages,
    stats
  ] = await Promise.all([
    getHeroGalleryImages(),
    getCachedHomeStats(),
  ]);
  return (
    <>
      <HeroSlider initialSlides={heroImages} />
      <WhatWeDo />
      <StatsSection
        members={stats.members}
        eventsHosted={stats.eventsHosted}
        yearsActive={stats.yearsActive}
        sponsors={stats.sponsorsCount}
      />
      <Suspense fallback={<div>Loading Leadership Messages...</div>}>
        <AsyncLeadershipContent />
      </Suspense>
      <Suspense fallback={<div>Loading Recent Events...</div>}>
        <AsyncRecentEvents />
      </Suspense>
      <Suspense fallback={<div>Loading Gallery...</div>}>
        <AsyncGallerySection />
      </Suspense>
      <Suspense fallback={<div>Loading Sponsors...</div>}>
        <AsyncSponsorsSection />
      </Suspense>
      <ExecutivesSection />
      <JoinCTA />
    </>
  );
}

async function AsyncLeadershipContent() {
  const messages = await getAllMessages();
  return (
      <LeadershipMessages messages={messages} />
  );
}
async function AsyncRecentEvents() {
  const events = await getPublicEvents();
  return (
      <RecentEvents events={events.items} />
  );
}
async function AsyncGallerySection() {
  const galleryImages = await getPublicGalleryImages();
  return (
      <GallerySection images={galleryImages} />
  );
}
async function AsyncSponsorsSection() {
  const sponsors = await getPublicSponsors();
  return (
      <SponsorsSection sponsors={sponsors} />
  );
}