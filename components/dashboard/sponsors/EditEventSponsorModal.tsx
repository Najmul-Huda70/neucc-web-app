"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Phone, MessageSquare } from "lucide-react";

type EventSponsorData = {
  id: string; // EventSponsor ID
  tier?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  comment?: string | null;
  isPublic?: boolean;
  eventTitle: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedItem: any) => void;
  sponsorData: EventSponsorData | null;
};

const SPONSOR_TIERS = ["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

export default function EditEventSponsorModal({
  isOpen,
  onClose,
  onSuccess,
  sponsorData,
}: Props) {
  const [tier, setTier] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sponsorData) {
      setTier(sponsorData.tier || "");
      setContactPerson(sponsorData.contactPerson || "");
      setEmail(sponsorData.email || "");
      setPhone(sponsorData.phone || "");
      setComment(sponsorData.comment || "");
      setIsPublic(sponsorData.isPublic ?? false);
    }
  }, [sponsorData]);

  if (!isOpen || !sponsorData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`/api/event-sponsors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sponsorData.id,
          tier: tier || null,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          comment: comment || null,
          isPublic,
        }),
      });

      const json = await res.json();

      if (json.success) {
        onSuccess({
          id: sponsorData.id,
          tier: tier || null,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          comment: comment || null,
          isPublic,
        });
        onClose();
      } else {
        setError(json.message || "Failed to update event sponsor details.");
      }
    } catch (err) {
      console.error("Update Event Sponsor Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-(--border-color) bg-(--bg-app) p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-(--border-color)">
          <div>
            <h2 className="text-base font-bold text-(--text-primary)">Edit Event Sponsorship</h2>
            <p className="text-xs text-(--text-muted)">{sponsorData.eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-(--text-muted) hover:bg-(--stat-card-bg) hover:text-(--text-primary)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Sponsor Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
            >
              <option value="">Select Tier (Optional)</option>
              {SPONSOR_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Person & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Contact Person
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3 text-(--text-muted)" />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3 text-(--text-muted)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Phone & Public Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone size={15} className="absolute left-3 text-(--text-muted)" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+8801700000000"
                  className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-(--border-color) text-(--btn-primary-bg) focus:ring-0"
              />
              <label htmlFor="isPublic" className="text-xs font-semibold text-(--text-primary) cursor-pointer select-none">
                Show Publicly on Event Page
              </label>
            </div>
          </div>

          {/* Internal Comment */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Internal Comment / Note
            </label>
            <div className="relative flex items-start">
              <MessageSquare size={15} className="absolute left-3 top-3 text-(--text-muted)" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add internal notes about sponsorship amount, agreement terms, etc..."
                rows={3}
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-9 pr-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-(--border-color)">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--stat-card-bg)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-5 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-sm hover:opacity-90 transition active:scale-95 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>Update Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}