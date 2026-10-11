"use client";

import React, { useEffect } from "react";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/Button";
import { X, AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";

  // Universal Form & Action Enhancements
  errorMessage?: string | null;
  isLoading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  showFooter?: boolean;
  submitText?: string;
  cancelText?: string;
  isSubmitDisabled?: boolean;
  submitVariant?: "primary" | "danger";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  errorMessage,
  isLoading = false,
  onSubmit,
  showFooter = false,
  submitText = "Save Changes",
  cancelText = "Cancel",
  isSubmitDisabled = false,
  submitVariant = "primary",
}: ModalProps) {
  // ESC Key & Background Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const modalContent = (
    <Card hoverEffect={false} padding="lg" className="shadow-2xl border-(--border-color)">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-(--border-color)">
        <div>
          {title && (
            <h3 className="text-base sm:text-lg font-bold text-(--text-primary)">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-(--text-muted) mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={isLoading}
          className="h-8 w-8 rounded-lg text-(--text-muted) hover:text-(--text-primary)"
        >
          <X size={18} />
        </Button>
      </div>

      {/* 🚨 Universal In-Modal Error Alert */}
      {errorMessage && (
        <div className="mt-4 bg-(--danger-bg) border border-(--danger-border) text-(--danger-text) rounded-xl p-3.5 flex items-start gap-2.5 animate-shake">
          <AlertCircle size={18} className="shrink-0 text-(--text-important) mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Body Content */}
      <div className="py-4 text-sm text-(--text-primary)">
        {children}
      </div>

      {/* Optional Built-in Footer (Buttons) */}
      {showFooter && (
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border-color) mt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            type={onSubmit ? "submit" : "button"}
            variant={submitVariant}
            size="sm"
            disabled={isSubmitDisabled || isLoading}
            isLoading={isLoading}
          >
            {submitText}
          </Button>
        </div>
      )}

    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-(--overlay-bg) backdrop-blur-xs transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} z-10`}>
        {onSubmit && showFooter ? (
          <form onSubmit={onSubmit}>{modalContent}</form>
        ) : (
          modalContent
        )}
      </div>
    </div>
  );
}