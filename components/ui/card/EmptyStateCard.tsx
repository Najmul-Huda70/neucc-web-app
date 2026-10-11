import React from "react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  href?: string;
}

export default function EmptyStateCard({
  title = "No Data Found",
  description = "There are no items to display at the moment.",
  icon = <FolderOpen size={36} className="text-(--text-muted)" />,
  actionText,
  onAction,
  href,
}: EmptyStateProps) {
  return (
    <Card
      hoverEffect={false}
      padding="lg"
      className="border-dashed border-2 border-(--border-color) bg-(--bg-app) flex flex-col items-center justify-center text-center my-4 py-12"
    >
      {/* Icon Container */}
      <div className="p-4 rounded-full bg-(--card-bg) border border-(--border-color) shadow-2xs mb-4">
        {icon}
      </div>

      {/* Text Info */}
      <h3 className="text-base sm:text-lg font-bold text-(--text-primary)">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-(--text-muted) max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Optional Action Button */}
      {actionText && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          href={href}
        >
          {actionText}
        </Button>
      )}
    </Card>
  );
}