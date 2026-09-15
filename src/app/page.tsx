import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSnapshot } from '@/components/sections/AboutSnapshot';
import { ClubInNumbers } from '@/components/sections/ClubInNumbers';
import { ChairpersonMessage } from '@/components/sections/ChairpersonMessage';
import { ModeratorMessage } from '@/components/sections/ModeratorMessage';
import { UpcomingEventsPreview } from '@/components/sections/UpcomingEventsPreview';
import { HighlightsAchievements } from '@/components/sections/HighlightsAchievements';
import { FeaturedCollaborations } from '@/components/sections/FeaturedCollaborations';
import { GalleryPreview } from '@/components/sections/GalleryPreview';
import { JoinCTA } from '@/components/sections/JoinCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSnapshot />
      <ClubInNumbers />
      <ChairpersonMessage />
      <ModeratorMessage />
      <UpcomingEventsPreview />
      <HighlightsAchievements />
      <FeaturedCollaborations />
      <GalleryPreview />
      <JoinCTA />
    </>
  );
}
