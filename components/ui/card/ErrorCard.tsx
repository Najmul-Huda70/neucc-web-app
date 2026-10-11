import React from "react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";

interface ErrorCardProps {
  code: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  primaryHref?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  secondaryHref?: string;
}

export default function ErrorCard({
  code,
  title,
  description,
  icon,
  primaryActionText = "Back to Home",
  onPrimaryAction,
  primaryHref = "/",
  secondaryActionText,
  onSecondaryAction,
  secondaryHref,
}: ErrorCardProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card
        hoverEffect={false}
        padding="lg"
        className="max-w-md w-full text-center border-dashed border-2 border-(--border-color) bg-(--bg-app)"
      >
        {/* Error Code & Icon */}
        <div className="flex flex-col items-center gap-3 mb-4">
          {icon ? (
            <div className="p-3.5 rounded-full bg-(--card-bg) border border-(--border-color) text-(--text-important) shadow-2xs">
              {icon}
            </div>
          ) : (
            <span className="text-5xl font-extrabold text-(--text-important) tracking-tight">
              {code}
            </span>
          )}
        </div>

        {/* Content */}
        <h2 className="text-xl sm:text-2xl font-bold text-(--text-primary)">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-(--text-muted) mt-2 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            href={primaryHref}
            onClick={onPrimaryAction}
            className="w-full sm:w-auto"
          >
            {primaryActionText}
          </Button>

          {secondaryActionText && (
            <Button
              variant="secondary"
              size="md"
              href={secondaryHref}
              onClick={onSecondaryAction}
              className="w-full sm:w-auto"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}