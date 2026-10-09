import HeroSlider from "@/components/public/hero";
import { getHeroGalleryImages } from "@/lib/services/gallery";
import type { Metadata } from "next";

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

  return (
    <main>
      <HeroSlider initialSlides={heroImages} />
    </main>
  );
}