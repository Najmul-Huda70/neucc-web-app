import { Metadata } from "next";
import { Lock } from "lucide-react";
import { getSystemSettings } from "@/lib/services/system-settings";
import MembershipFormClient from "@/components/public/membership/MembershipFormClient";

export const dynamic = "force-dynamic"; // Ensures real-time database state check

export const metadata: Metadata = {
  title: "Membership Registration | NEU Computer Club",
  description: "Apply for NEU Computer Club membership",
};

export default async function MembershipPage() {
  // Fetch System Settings from DB
  const settingsRes = await getSystemSettings();
  const isMembershipOpen = settingsRes.success && settingsRes.data?.isMembershipOpen;

  // Render "Registration Closed" state if false
  if (!isMembershipOpen) {
    return (
      <div className="w-full min-h-[calc(100vh-120px)] flex flex-col items-center justify-center bg-(--bg-app) px-4 py-8 text-(--text-primary)">
        <div className="w-full max-w-md rounded-2xl bg-(--card-bg) border border-(--border-color) p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--stat-card-bg) text-(--btn-primary-bg) border border-(--border-color)">
            <Lock size={26} aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Registration Closed
            </h2>
            <p className="text-xs text-(--text-secondary) md:text-sm leading-relaxed">
              The membership registration form is currently closed. If you wish to become a member, please contact us at{" "}
              <a
                href="mailto:computerclub@neu.ac.bd"
                className="font-medium text-(--btn-primary-bg) underline hover:opacity-80 transition-opacity"
              >
                computerclub@neu.ac.bd
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render active registration form if true
  return <MembershipFormClient />;
}