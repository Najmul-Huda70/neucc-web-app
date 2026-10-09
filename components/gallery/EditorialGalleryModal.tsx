"use client";

import type { ReactNode } from "react";

type EditorialGalleryModalProps = {
  isModalMounted: boolean;
  isModalVisible: boolean;
  onCloseModal: () => void;
  children: ReactNode;
};

export default function EditorialGalleryModal({
  isModalMounted,
  isModalVisible,
  onCloseModal,
  children,
}: EditorialGalleryModalProps) {
  if (!isModalMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md sm:p-6 transition-all duration-300 ease-out ${
        isModalVisible ? "bg-black/80 opacity-100" : "bg-black/0 opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Event image viewer"
      onClick={onCloseModal}
    >
      <div
        className={`relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--card-bg) shadow-2xl sm:max-h-[calc(100vh-3rem)] transition-all duration-300 ease-out ${
          isModalVisible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}