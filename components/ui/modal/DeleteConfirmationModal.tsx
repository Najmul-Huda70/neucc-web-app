"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/modal/Modal";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemType?: string;
  apiEndpoint: string;
  warningMessage?: string;
  onSuccess?: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  itemTitle,
  itemType = "Item",
  apiEndpoint,
  warningMessage,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const [typedTitle, setTypedTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMatch = typedTitle.trim() === itemTitle.trim();

  const handleModalClose = () => {
    if (isLoading) return;
    setTypedTitle("");
    setErrorMessage(null);
    onClose();
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || `Failed to delete ${itemType.toLowerCase()}`);
      }

      toast.success(`${itemType} "${itemTitle}" permanently deleted!`);
      if (onSuccess) onSuccess();
      handleModalClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={`Delete ${itemType}`}
      maxWidth="md"
      showFooter={false} // কাস্টম ফুটারের জন্য ফলস রাখা হলো
    >
      <form onSubmit={handleDeleteSubmit} className="space-y-4">
        {/* Error Alert inside Modal */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Warning Box */}
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 text-rose-500 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">This action cannot be undone!</p>
            <p className="leading-relaxed">
              This will permanently delete the {itemType.toLowerCase()}{" "}
              <span className="font-bold underline">{itemTitle}</span>.
              {warningMessage && ` ${warningMessage}`}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2 pt-1">
          <label className="text-xs text-(--text-muted) block leading-normal">
            To confirm, type <span className="font-bold text-(--text-primary) select-all">"{itemTitle}"</span> in the box below:
          </label>
          <input
            type="text"
            value={typedTitle}
            onChange={(e) => {
              setTypedTitle(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={itemTitle}
            disabled={isLoading}
            className="w-full bg-(--input-bg) border border-(--border-color) text-(--text-primary) text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-rose-500 transition disabled:opacity-50"
          />
        </div>

        {/* Custom Visible Buttons */}
        <div className="flex justify-end gap-2 border-t border-(--border-color) pt-4 mt-6">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-(--border-color) text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-app)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isMatch || isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isLoading ? "Deleting..." : `Delete ${itemType}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}