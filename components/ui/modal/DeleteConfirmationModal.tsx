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

  // ইনপুট টাইটেল ও অরিজিনাল টাইটেল হুবহু মিললে তবেই ডিলিট বাটন একটিভ হবে
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
        throw new Error(data.message || `Failed to delete ${itemType.toLowerCase()}`);
      }

      // ✅ SUCCESS: টোস্ট শো করবে এবং মোডাল বন্ধ হবে
      toast.success(`${itemType} "${itemTitle}" permanently deleted!`);
      if (onSuccess) onSuccess();
      handleModalClose();
    } catch (err: any) {
      // ❌ ERROR: মোডাল বন্ধ হবে না, ইন-মোডাল এরর অ্যালার্টে মেসেজ শো করবে
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
      errorMessage={errorMessage}
      isLoading={isLoading}
      onSubmit={handleDeleteSubmit}
      showFooter={true}
      submitText={`Delete ${itemType}`}
      submitVariant="danger"
      isSubmitDisabled={!isMatch}
    >
      <div className="space-y-4">
        {/* Warning Box */}
        <div className="bg-(--danger-bg) border border-(--danger-border) text-(--danger-text) rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 text-(--text-important) mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">This action cannot be undone!</p>
            <p className="leading-relaxed">
              This will permanently delete the {itemType.toLowerCase()}{" "}
              <span className="font-bold underline">{itemTitle}</span>.
              {warningMessage && ` ${warningMessage}`}
            </p>
          </div>
        </div>

        {/* Confirmation Type-to-Confirm Input */}
        <div className="space-y-2 pt-1">
          <label className="text-xs text-(--text-muted) block leading-normal">
            To confirm, type <span className="font-bold text-(--text-primary) select-all">"{itemTitle}"</span> in the box below:
          </label>
          <input
            type="text"
            value={typedTitle}
            onChange={(e) => {
              setTypedTitle(e.target.value);
              if (errorMessage) setErrorMessage(null); // টাইপ শুরু করলে এরর হাইড হবে
            }}
            placeholder={itemTitle}
            disabled={isLoading}
            className="w-full bg-(--input-bg) border border-(--input-border) text-(--text-primary) text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-(--focus-ring) transition disabled:opacity-50"
          />
        </div>
      </div>
    </Modal>
  );
}