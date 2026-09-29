"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import ProfileHeaderCard from "@/components/dashboard/profile/ProfileHeaderCard";
import DesignationCard, { UserPostRelation } from "@/components/dashboard/profile/DesignationCard";
import GeneralDetailsForm from "@/components/dashboard/profile/GeneralDetailsForm";
import SecurityForm from "@/components/dashboard/profile/SecurityForm";
import { Role } from "@/lib/types";
import { useRouter } from "next/navigation";

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router =useRouter();
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
      } else {
        setErrorMsg(data.error || "Failed to load profile details.");
      }
    } catch {
      setErrorMsg("An error occurred while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (message: string) => {
    setSuccessMsg(message);
    setErrorMsg("");
    fetchProfile();
    router.refresh();
  };

  const handleError = (message: string) => {
    setErrorMsg(message);
    setSuccessMsg("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-75">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5 sm:space-y-6 text-slate-800">
      {/* Alert Messages */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 sm:p-4 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 sm:p-4 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Profile Photo Header */}
      <ProfileHeaderCard
        userId={profile?.userId}
        name={profile?.name}
        role={profile?.role}
        currentImage={profile?.image}
        onUpdateSuccess={() => handleUpdateSuccess("Profile photo updated successfully!")}
        onError={handleError}
      />

      {/* 2. Designation Details */}
      <DesignationCard userPosts={profile?.user_posts} />

      {/* 3. General Information Form */}
      {profile && (
        <GeneralDetailsForm
          initialName={profile.name}
          initialEmail={profile.email}
          onUpdateSuccess={() => handleUpdateSuccess("General profile details updated successfully!")}
          onError={handleError}
        />
      )}

      {/* 4. Password / Security Form */}
      <SecurityForm
        onUpdateSuccess={() => handleUpdateSuccess("Password updated successfully!")}
        onError={handleError}
      />
    </div>
  );
}