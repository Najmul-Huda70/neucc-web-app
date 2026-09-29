"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteUserConfirmationModalProps {
  isOpen: boolean;
  userName: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteUserConfirmationModal({
  isOpen,
  userName,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteUserConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--btn-secondary-border)] bg-[var(--card-bg)] p-6 shadow-xl transition-all">
        
        {/* Warning Icon Header */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[var(--text-important)] ring-8 ring-red-50">
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Delete User Account
          </h3>
          <p className="mt-2 text-sm text-[var(--text-primary)]/80">
            Are you sure you want to delete <span className="font-semibold text-[var(--text-secondary)]">"{userName}"</span>?
          </p>
          
          <div className="mt-4 rounded-xl border border-red-200 bg-[var(--stat-card-bg)] p-3 text-xs text-[var(--text-important)] text-left">
            <strong>Warning:</strong> This action is permanent. All associated committee post assignments for this user will also be removed from the system.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-[var(--btn-secondary-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--stat-card-bg)] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--text-important)] px-4 py-2 text-sm font-medium text-[var(--btn-primary-text)] hover:bg-red-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}