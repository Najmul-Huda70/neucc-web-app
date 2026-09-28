"use client";

import { useRef, useState } from "react";
import { User, Crown, ShieldCheck, UserCheck, Camera, Loader2, Trash2 } from "lucide-react";

type RoleType = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "MEMBER";

interface ProfileHeaderCardProps {
  userId?: string;
  name?: string;
  role?: RoleType;
  currentImage?: string | null;
  onUpdateSuccess: () => void;
  onError: (msg: string) => void;
}

export default function ProfileHeaderCard({
  userId,
  name,
  role,
  currentImage,
  onUpdateSuccess,
  onError,
}: ProfileHeaderCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getRoleBadge = (userRole?: RoleType) => {
    switch (userRole) {
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onError("Image size should be maximum 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      onError("");
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    setUploading(true);
    onError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedFile(null);
        onUpdateSuccess();
      } else {
        onError(data.error || "Failed to update profile image.");
      }
    } catch {
      onError("An error occurred while uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    onError("");

    try {
      const formData = new FormData();
      formData.append("removeImage", "true");

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onUpdateSuccess();
      } else {
        onError(data.error || "Failed to remove image.");
      }
    } catch {
      onError("An error occurred while removing image.");
    } finally {
      setUploading(false);
    }
  };

  const roleInfo = getRoleBadge(role);

  return (
    <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-all">
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

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full border-2 border-white shadow-md transition-transform active:scale-95 cursor-pointer"
            title="Choose photo"
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* User Info & Actions */}
        <div className="space-y-2 flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              {name}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${roleInfo.badgeClass}`}>
              {roleInfo.icon}
              {roleInfo.label}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            User ID: {userId}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition cursor-pointer"
            >
              Choose Photo
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition cursor-pointer disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Upload New Image
              </button>
            )}

            {currentImage && !selectedFile && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}