"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, UserCheck, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import GeneralDetailsForm from "@/components/dashboard/profile/GeneralDetailsForm";
import SecurityForm from "@/components/dashboard/profile/SecurityForm";
import ProfilePhotoTab from "@/components/dashboard/profile/ProfilePhotoTab";
import ErrorState from "@/components/ui/ErrorState";
import ProfileSkeleton from "@/components/dashboard/profile/ProfileSkeleton";
import { Role } from "@/lib/types";
import { useRouter } from "next/navigation";

interface UserPostRelation {
  post: {
    postId?: string;
    postTitle: string;
    committee?: {
      committeeId?: string;
      type: string;
      year: number;
      status: string;
    } | null;
  };
}

interface UserProfile {
  userId?: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  status: string;
  createdAt?: string;
  user_posts?: UserPostRelation[];
}

type TabType = "photo" | "general" | "security";

const getRoleBadge = (role?: string) => {
  const normalizedRole = role?.toUpperCase();

  switch (normalizedRole) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return {
        icon: <Shield className="w-3.5 h-3.5 text-amber-600" />,
        style: "text-amber-800 bg-amber-50 border-amber-200/80",
        label: "Admin",
      };
    case "MODERATOR":
      return {
        icon: <UserCheck className="w-3.5 h-3.5 text-teal-600" />,
        style: "text-teal-800 bg-teal-50 border-teal-200/80",
        label: "Moderator",
      };
    case "MEMBER":
    default:
      return {
        icon: <User className="w-3.5 h-3.5 text-slate-600" />,
        style: "text-slate-700 bg-slate-100 border-slate-200",
        label: "Member",
      };
  }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("photo");
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
      } else {
        throw new Error(data.error || "Failed to load profile details.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to load profile details.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateSuccess = (message: string) => {
    toast.success(message);
    fetchProfile();
    router.refresh();
  };

  const handleError = (message: string) => {
    if (!message || message.trim() === "") return;
    toast.error(message);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-6 pb-6 space-y-4 sm:space-y-6 text-slate-800">
      {/* Toast Provider */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Always Fixed Header Title */}
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl leading-none text-slate-900 px-1">
        Profile Settings
      </h1>

      {/* Dynamic Content Switching */}
      {loading ? (
        <ProfileSkeleton />
      ) : error || !profile ? (
        <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <ErrorState
            message={error || "Profile not found."}
            onRetry={fetchProfile}
          />
        </div>
      ) : (
        /* Outer Profile Card Wrapper */
        <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Top Profile Summary Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-xl bg-teal-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                    {profile.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  {profile.user_posts?.[0]?.post?.postTitle ? (
                    <>
                      {profile.user_posts[0].post.postTitle} •&nbsp;The&nbsp;
                      {profile.user_posts[0].post.committee?.type &&
                        profile.user_posts[0].post.committee.type
                          .charAt(0)
                          .toUpperCase() +
                          profile.user_posts[0].post.committee.type
                            .slice(1)
                            .toLowerCase()}
                      &nbsp;Committee -{" "}
                      {profile.user_posts[0].post.committee?.year}
                    </>
                  ) : (
                    <>{profile.email}</>
                  )}
                </p>
              </div>
            </div>

            {(() => {
              const badge = getRoleBadge(profile.role);
              return (
                <div
                  className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${badge.style}`}
                >
                  {badge.icon}
                  <span className="capitalize">{badge.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Sub-navigation Tabs */}
          <div className="w-full border-b border-slate-200 bg-white">
            <div className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("photo")}
                className={`py-2 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "photo"
                    ? "border-teal-600 text-teal-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Profile Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-2 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "general"
                    ? "border-teal-600 text-teal-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                General Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`py-2 sm:py-3.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === "security"
                    ? "border-teal-600 text-teal-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Security & Password
              </button>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="w-full p-4 sm:p-8">
            {activeTab === "photo" && (
              <ProfilePhotoTab
                currentImage={profile.image}
                onUpdateSuccess={() =>
                  handleUpdateSuccess("Profile photo updated successfully!")
                }
                onError={handleError}
              />
            )}

            {activeTab === "general" && (
              <GeneralDetailsForm
                initialName={profile.name}
                initialEmail={profile.email}
                onUpdateSuccess={() =>
                  handleUpdateSuccess("General profile details updated successfully!")
                }
                onError={handleError}
              />
            )}

            {activeTab === "security" && (
              <SecurityForm
                onUpdateSuccess={() =>
                  handleUpdateSuccess("Password updated successfully!")
                }
                onError={handleError}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}