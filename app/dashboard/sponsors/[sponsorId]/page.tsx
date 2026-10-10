import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSponsorDetailsById } from "@/lib/services/sponsors";
import SponsorDetailsClient from "@/components/dashboard/sponsors/SponsorDetailsClient";

export async function generateMetadata({ params }: { params: Promise<{ sponsorId: string }> }) {
  const { sponsorId } = await params;
  const sponsor = await prisma.sponsor.findUnique({
    where: { sponsorId },
    select: { name: true },
  });

  if (!sponsor) {
    return { title: "Sponsor Not Found" };
  }

  return {
    title: `${sponsor.name} - Sponsor Details | NEUCC`,
    description: `Manage sponsorship details, linked events, and contact persons for ${sponsor.name}.`,
  };
}

async function getSponsorDetails(sponsorId: string) {
  try {
    const sponsor = await getSponsorDetailsById(sponsorId);
    if (!sponsor) return null;
    return sponsor;
  } catch (error) {
    console.error("Error fetching sponsor details for SSR:", error);
    return null;
  }
}

function SponsorDetailsLoading() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-(--stat-card-bg) rounded-xl w-1/3"></div>
      <div className="flex gap-4">
        <div className="h-10 bg-(--stat-card-bg) rounded-xl w-1/2"></div>
        <div className="h-10 bg-(--stat-card-bg) rounded-xl w-32"></div>
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-32 bg-(--stat-card-bg) rounded-2xl w-full"></div>
        <div className="h-32 bg-(--stat-card-bg) rounded-2xl w-full"></div>
      </div>
    </div>
  );
}

export default async function SponsorDetailsPage({
  params,
}: {
  params: Promise<{ sponsorId: string }>;
}) {
  const { sponsorId } = await params;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Suspense fallback={<SponsorDetailsLoading />}>
        <SponsorDetailsContainer sponsorId={sponsorId} />
      </Suspense>
    </div>
  );
}

async function SponsorDetailsContainer({ sponsorId }: { sponsorId: string }) {
  const sponsor = await getSponsorDetails(sponsorId);

  if (!sponsor) {
    notFound();
  }

  return <SponsorDetailsClient initialSponsor={sponsor} />;
}