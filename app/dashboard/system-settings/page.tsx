import { Suspense } from "react";
import { Metadata } from "next";
import { Sliders } from "lucide-react";
import { getSystemSettings } from "@/lib/services/system-settings";
import SystemSettingsClient from "@/components/dashboard/system-settings/SystemSettingsClient";

export const metadata: Metadata = {
  title: "System Settings | NEU Computer Club Admin",
  description: "Manage global access, public registrations, and system configurations.",
  robots: { index: false, follow: false },
};

async function SettingsContent() {
  const res = await getSystemSettings();

  if (!res.success || !res.data) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
        {res.error || "Failed to load system settings"}
      </div>
    );
  }

  return <SystemSettingsClient initialState={res.data.isMembershipOpen} />;
}

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl p-6">
      {/* Dynamic Heading & Description (Loads Instantly via SSR) */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-(--card-bg) border border-(--border-color) text-(--btn-primary-bg)">
          <Sliders size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">System Settings</h1>
          <p className="text-xs text-(--text-secondary) mt-0.5">
            Manage global access, registration toggles, and platform behavior for NEU Computer Club.
          </p>
        </div>
      </div>

      {/* Main Settings Card Container */}
      <div className="rounded-2xl border border-(--border-color) bg-(--card-bg) p-6 shadow-sm">
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="flex items-center justify-between py-2 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-48 bg-(--border-color) rounded-md" />
        <div className="h-3 w-80 bg-(--border-color) rounded-md" />
      </div>
      <div className="h-7 w-20 bg-(--border-color) rounded-full" />
    </div>
  );
}