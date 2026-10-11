"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";

interface MessageCardProps {
  item: {
    messageId: string;
    role: "CHAIRMAN" | "ADVISOR";
    name: string;
    designation: string;
    photoUrl: string | null;
    displayOrder: number;
    message: string;
  };
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  showActions?: boolean; // পাবলিক পেজে ট্রু না দিলে বাটনগুলো হাইড থাকবে
}

export default function MessageCard({
  item,
  onEdit,
  onDelete,
  showActions = true,
}: MessageCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-gray-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-300 group">
      {/* Top Right Action Buttons */}
      {showActions && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition shadow-2xs"
              title="Edit"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-2xs"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Centered Profile Picture */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500/20 bg-gray-50 mb-4 shadow-2xs">
        {item.photoUrl ? (
          <Image
            src={item.photoUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-bold text-xl text-gray-400">
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name & Designation */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
        {item.name}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 mb-5">
        {item.designation}
      </p>

      {/* Quotation Message */}
      <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed font-normal max-w-prose">
        "{item.message}"
      </p>
    </div>
  );
}