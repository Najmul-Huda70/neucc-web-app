"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Loader2,
  Building2,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
} from "lucide-react";

type Sponsor = {
  sponsorId: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
};

type UpdatedCompanyData = {
  name: string;
  logoUrl?: string | null;
  website?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData: UpdatedCompanyData) => void;
  sponsor: Sponsor;
};

export default function EditCompanyModal({
  isOpen,
  onClose,
  onSuccess,
  sponsor,
}: Props) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");

  // Tab state: "url" | "upload"
  const [uploadType, setUploadType] = useState<"url" | "upload">("url");
  const [logoUrl, setLogoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sponsor) {
      setName(sponsor.name || "");
      setWebsite(sponsor.website || "");
      setLogoUrl(sponsor.logoUrl || "");
      setImagePreview(sponsor.logoUrl || null);
      setUploadType(sponsor.logoUrl?.startsWith("data:image/") ? "upload" : "url");
    }
  }, [sponsor]);

  if (!isOpen) return null;

  // Handle Local File Selection or Drag & Drop
  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or smaller.");
      return;
    }

    setError("");
    setImageFile(file);

    // Preview local file
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let finalLogoUrl = uploadType === "url" ? logoUrl : imagePreview;

      // যদি ইউজার নতুন ফাইল সিলেক্ট করে থাকে, তবে Cloudinary-তে আপলোড করা হবে
      if (uploadType === "upload" && imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        setUploadingImage(false);

        if (!uploadJson.success) {
          setError(uploadJson.message || "Failed to upload logo to Cloudinary.");
          setSubmitting(false);
          return;
        }

        finalLogoUrl = uploadJson.data.url;
      }

      // স্পন্সর আপডেট API কল
      const res = await fetch(`/api/sponsors/${sponsor.sponsorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          logoUrl: finalLogoUrl || null,
          website: website.trim() || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        // সফলভাবে আপডেট হওয়ার পর প্যারেন্ট কম্পোনেন্টে ডাটা পাস করা হচ্ছে
        onSuccess({
          name: name.trim(),
          logoUrl: finalLogoUrl || null,
          website: website.trim() || null,
        });
        onClose();
      } else {
        setError(json.message || "Failed to update company.");
      }
    } catch (err) {
      console.error("Error updating sponsor:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--bg-app) p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
          <h2 className="text-lg font-bold text-(--text-primary)">
            Edit Company Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--text-muted) hover:bg-(--stat-card-bg) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Company Name *
            </label>
            <div className="relative flex items-center">
              <Building2 size={16} className="absolute left-3 text-(--text-muted)" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brain Station 23"
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Logo Input Option (URL vs Upload) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-(--text-primary)">
                Company Logo
              </label>

              {/* Tab Toggle */}
              <div className="flex items-center rounded-lg bg-(--stat-card-bg) p-0.5">
                <button
                  type="button"
                  onClick={() => setUploadType("url")}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                    uploadType === "url"
                      ? "bg-(--card-bg) text-(--text-primary) shadow-2xs"
                      : "text-(--text-muted)"
                  }`}
                >
                  <LinkIcon size={11} />
                  <span>URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType("upload")}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                    uploadType === "upload"
                      ? "bg-(--card-bg) text-(--text-primary) shadow-2xs"
                      : "text-(--text-muted)"
                  }`}
                >
                  <Upload size={11} />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {uploadType === "url" ? (
              <div className="relative flex items-center">
                <ImageIcon size={16} className="absolute left-3 text-(--text-muted)" />
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
                />
              </div>
            ) : (
              /* Drag & Drop File Upload Area */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border-color) bg-(--card-bg) p-4 text-center cursor-pointer hover:border-(--btn-primary-bg) transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />

                {imagePreview ? (
                  <div className="relative h-20 w-full flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                        setImageFile(null);
                        setLogoUrl("");
                      }}
                      className="absolute top-0 right-0 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Upload
                      size={20}
                      className="text-(--text-muted) group-hover:text-(--btn-primary-bg) transition-colors"
                    />
                    <p className="text-xs font-medium text-(--text-primary)">
                      Click to upload{" "}
                      <span className="text-(--text-muted)">or drag and drop</span>
                    </p>
                    <p className="text-[10px] text-(--text-muted)">
                      SVG, PNG, JPG or WEBP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Website URL
            </label>
            <div className="relative flex items-center">
              <Globe size={16} className="absolute left-3 text-(--text-muted)" />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-(--border-color)">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--stat-card-bg)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-sm hover:opacity-90 transition active:scale-95 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{uploadingImage ? "Uploading Logo..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}