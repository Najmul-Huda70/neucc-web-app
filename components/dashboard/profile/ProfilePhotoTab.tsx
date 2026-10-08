"use client";

import { useState, useRef, ReactNode } from "react";
import { UploadCloud, Loader2, Crop, Trash2 } from "lucide-react";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ProfilePhotoTabProps {
  currentImage?: string | null;
  onUpdateSuccess: () => void;
  onError: (msg: string) => void;
}

export default function ProfilePhotoTab({
  currentImage,
  onUpdateSuccess,
  onError,
}: ProfilePhotoTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<CropType>({ unit: "%", width: 80, height: 80, x: 10, y: 10 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      onError("Image size should be maximum 5MB.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "");
      setIsCropping(true);
    });
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  };

  // Generate cropped image blob
  const getCroppedImgBlob = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
    });
  };

  const handleSave = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      if (imgRef.current && completedCrop) {
        const croppedBlob = await getCroppedImgBlob(imgRef.current, completedCrop);
        formData.append("image", croppedBlob, "profile.jpg");
      } else if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setIsCropping(false);
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

  const handleDiscard = () => {
    setSelectedFile(null);
    setImgSrc("");
    setIsCropping(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Left Info Column */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">Personal Photo</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This photo is your identity across the platform.
        </p>
      </div>

      {/* Right Upload Area */}
      <div className="md:col-span-2 space-y-4">
        {isCropping ? (
          /* Cropper Modal Area */
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Crop className="w-4 h-4 text-teal-600" /> Crop your photo before saving:
            </p>
            <div className="max-h-[350px] overflow-auto flex justify-center bg-black/5 p-2 rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop target"
                  className="max-h-[300px] object-contain"
                />
              </ReactCrop>
            </div>
          </div>
        ) : (
          /* Dropzone Area */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-colors flex flex-col items-center justify-center ${
              isDragOver ? "border-teal-500 bg-teal-50/30" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt="Current profile"
                className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-teal-600 shadow-xs"
              />
            ) : (
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
            )}

            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Drag/upload an image
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Upload
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isCropping && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={uploading}
              className="px-4 py-2 text-xs sm:text-sm font-medium border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Discard changes
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}