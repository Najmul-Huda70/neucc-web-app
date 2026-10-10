import { Suspense } from "react";
import { Metadata } from "next";
import { getAdminSponsors } from "@/lib/services/sponsors";
import SponsorsDashboardClient from "@/components/dashboard/sponsors/SponsorsDashboardClient";
import SponsorsSkeletonGrid from "@/components/dashboard/sponsors/SponsorsSkeletonGrid";

export const metadata: Metadata = {
  title: "Sponsors Management | Dashboard",
  description: "Manage corporate partners and sponsored events.",
};

// Async Component to fetch data on Server
async function SponsorsContent() {
  const sponsors = await getAdminSponsors();
  return <SponsorsDashboardClient initialSponsors={sponsors} />;
}

export default function SponsorsManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <Suspense fallback={<SponsorsSkeletonGrid />}>
        <SponsorsContent />
      </Suspense>
    </div>
  );
}