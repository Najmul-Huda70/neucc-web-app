import { Suspense } from "react";
import { Metadata } from "next";
import { getSarokCategories } from "@/lib/services/sarok";
import SarokClientManager from "@/components/dashboard/sarok/SarokClientManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sarok Management | Admin Dashboard",
  description: "Manage notice sarok categories, codes, and sections.",
};

async function SarokContent() {
  const res = await getSarokCategories();

  if (!res.success || !res.data) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
        {res.error || "Failed to load sarok categories"}
      </div>
    );
  }

  return <SarokClientManager initialCategories={res.data} />;
}

export default function SarokPage() {
  return (
    <div className="space-y-6 max-w-6xl p-6">
      <Suspense fallback={<div className="text-xs text-(--text-secondary)">Loading sarok categories...</div>}>
        <SarokContent />
      </Suspense>
    </div>
  );
}