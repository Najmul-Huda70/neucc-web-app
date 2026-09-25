"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Crown,
  UserCheck,
  Key,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Calendar,
  Award,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";

type RoleType = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "MEMBER";

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: RoleType;
  image?: string | null;
  status: string;
  createdAt: string;
  post?: {
    postId: string;
    postTitle: string;
    committee?: {
      id: string;
      type: string;
      session: string;
      status: string;
    };
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Avatar states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        if (data.user.image) {
          setPreviewUrl(data.user.image);
        }
      } else {
        setErrorMsg(data.error || "Failed to load profile details.");
      }
    } catch {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Image size should be maximum 5MB.");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsImageRemoved(false);
      setErrorMsg("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match!");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      if (currentPassword) formData.append("currentPassword", currentPassword);
      if (newPassword) formData.append("newPassword", newPassword);

      if (isImageRemoved) {
        formData.append("removeImage", "true");
      } else if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Profile updated successfully!");
        setProfile(data.user);
        setSelectedImage(null);
        setPreviewUrl(data.user.image || null);
        setIsImageRemoved(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role?: RoleType) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          icon: <Crown className="w-3.5 h-3.5 text-amber-700" />,
          label: "Super Admin",
          badgeClass: "bg-amber-100/80 text-amber-900 border-amber-200/80",
        };
      case "ADMIN":
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />,
          label: "Admin",
          badgeClass: "bg-teal-100/80 text-teal-900 border-teal-200/80",
        };
      case "MODERATOR":
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-700" />,
          label: "Moderator",
          badgeClass: "bg-indigo-100/80 text-indigo-900 border-indigo-200/80",
        };
      default:
        return {
          icon: <User className="w-3.5 h-3.5 text-slate-700" />,
          label: "Member",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const roleInfo = getRoleBadge(profile?.role);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-5 sm:space-y-6 text-slate-800">
      
      {/* 1. Header Card (Image & Basic Info) */}
      <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center overflow-hidden shadow-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-700" />
              )}
            </div>

            {/* Camera Overlay Icon */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full border-2 border-white shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* User Info & Actions */}
          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                {profile?.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${roleInfo.badgeClass}`}>
                {roleInfo.icon}
                {roleInfo.label}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              User ID: {profile?.userId}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
              >
                Change photo
              </button>

              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="flex items-start sm:items-center gap-2.5 p-3.5 sm:p-4 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start sm:items-center gap-2.5 p-3.5 sm:p-4 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 sm:mt-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Designation Card */}
      {profile?.post && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <Award className="w-4 h-4" /> Assigned Designation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                <Award size={13} className="text-teal-600" /> Post Title
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase">{profile.post.postTitle}</p>
            </div>

            {profile.post.committee && (
              <>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                    <Building2 size={13} className="text-teal-600" /> Committee
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 uppercase">{profile.post.committee.type}</p>
                </div>

                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 sm:col-span-2 lg:col-span-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                    <Calendar size={13} className="text-teal-600" /> Session
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">{profile.post.committee.session}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Dynamic Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-5 sm:space-y-6">
        
        {/* General Details Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
            General Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
            Security
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Current Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2.5 rounded-xl transition disabled:opacity-50 font-medium text-xs sm:text-sm cursor-pointer shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}