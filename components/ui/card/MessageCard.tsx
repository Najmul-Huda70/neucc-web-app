"use client";

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import Card from "@/components/ui/card/Card";
import TitleDescription from "@/components/ui/TitleDescription";

export interface MessageItem {
  messageId: string;
  role: "CHAIRMAN" | "ADVISOR";
  name: string;
  designation: string;
  photoUrl: string | null;
  displayOrder: number;
  message: string;
  createdAt: string | Date;
}

interface MessageCardProps {
  item: MessageItem;
  showActions?: boolean;
  onEdit?: (item: MessageItem) => void;
  onDelete?: (item: MessageItem) => void;
  className?: string;
}

export default function MessageCard({
  item,
  showActions = false,
  onEdit,
  onDelete,
  className = "",
}: MessageCardProps) {
  return (
    <Card padding="lg" className={`h-full flex flex-col justify-between text-center ${className}`}>
      <div className="space-y-4">
        {/* Centered Profile Avatar */}
        <div className="flex justify-center">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-(--border-color) bg-(--bg-subtle) shadow-sm">
            {item.photoUrl ? (
              <Image
                src={item.photoUrl}
                alt={item.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-(--text-muted)">
                <User size={36} />
              </div>
            )}
          </div>
        </div>

        {/* Name & Designation using TitleDescription Component */}
        <TitleDescription
          title={item.name}
          description={item.designation}
          as="h3"
        />

        {/* Message Content Body */}
        <p className="text-xs sm:text-sm leading-relaxed text-(--text-muted) italic pt-2">
          &quot;{item.message}&quot;
        </p>
      </div>

      {/* Optional Dashboard Action Buttons */}
      {showActions && (onEdit || onDelete) && (
        <div className="mt-6 pt-3 border-t border-(--border-color) flex items-center justify-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-(--bg-subtle) text-(--text-primary) hover:bg-(--card-hover) transition cursor-pointer"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </Card>
  );
}