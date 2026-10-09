import type { Metadata } from "next";
import { getPublicCommittees } from "@/lib/services/committees";
import CommitteeClientPage from "@/components/public/committees/CommitteeClientPage";

export const metadata: Metadata = {
  title: "Executive & Advisory Committees | NEU Computer Club",
  description:
    "Meet the executive panel, election committee, and advisory board members of NEU Computer Club, Department of CSE, North East University Bangladesh.",
  openGraph: {
    title: "Executive & Advisory Committees | NEU Computer Club",
    description:
      "Meet the executive panel, election committee, and advisory board members of NEU Computer Club.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Executive & Advisory Committees | NEU Computer Club",
    description:
      "Meet the executive panel, election committee, and advisory board members of NEU Computer Club.",
  },
};

export default async function CommitteesPage() {
  // Direct DB Query on Server (No Client API fetch latency)
  const committees = await getPublicCommittees();

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-8">
      <CommitteeClientPage initialCommittees={committees as any} />
    </main>
  );
}