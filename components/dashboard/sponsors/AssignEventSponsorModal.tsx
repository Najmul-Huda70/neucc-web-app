"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

type EventItem = {
  eventId: string;
  title: string;
  slug?: string;
};

type EventSponsorItem = {
  id: string;
  tier?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  comment?: string | null;
  isPublic?: boolean;
  event: {
    eventId: string;
    title: string;
    slug: string;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEventSponsor: EventSponsorItem) => void;
  sponsorId: string;
};

const SPONSOR_TIERS = ["TITLE", "PLATINUM", "GOLD", "SILVER", "BRONZE", "PARTNER"];

export default function AssignEventSponsorModal({
  isOpen,
  onClose,
  onSuccess,
  sponsorId,
}: Props) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [tier, setTier] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoadingEvents(true);
      fetch("/api/events?pageSize=100")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const rawData = data.data?.items || data.data;
            if (Array.isArray(rawData)) {
              setEvents(rawData);
            } else {
              setEvents([]);
            }
          } else {
            setEvents([]);
          }
        })
        .catch(() => {
          setEvents([]);
        })
        .finally(() => setLoadingEvents(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setError("Please select an event.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res =await(
        await fetch("/api/event-sponsors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: selectedEventId,
            sponsorId,
            tier: tier || null,
            contactPerson: contactPerson || null,
            email: email || null,
            phone: phone || null,
            comment: comment || null,
            isPublic,
          }),
        })
      );

      const json = await res.json();

      if (json.success) {
        // নির্বাচিত ইভেন্টের অবজেক্ট খুঁজে বের করা টাইটেল ও স্লাগ দেখানোর জন্য
        const selectedEvent = events.find((ev) => ev.eventId === selectedEventId);

        // সফলভাবে তৈরি হওয়া ইভেন্ট স্পন্সর আইটেমটি প্যারেন্ট কম্পোনেন্টে পাস করা হচ্ছে
        onSuccess({
          id: json.data?.id || crypto.randomUUID(), // API থেকে id আসলে সেটি অথবা ফলব্যাক
          tier: tier || null,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          comment: comment || null,
          isPublic,
          event: {
            eventId: selectedEventId,
            title: selectedEvent?.title || "Untitled Event",
            slug: selectedEvent?.slug || "",
          },
        });

        onClose();
      } else {
        setError(json.message || "Failed to assign sponsor to event.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-(--border-color) bg-(--bg-app) p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-(--border-color)">
          <h2 className="text-base font-bold text-(--text-primary)">Assign to New Event</h2>
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

          {/* Event Selection */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Select Event *
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              required
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
            >
              <option value="">{loadingEvents ? "Loading events..." : "Select an Event"}</option>
              {Array.isArray(events) &&
                events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.title}
                  </option>
                ))}
            </select>
          </div>

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

          {/* Contact Person, Email & Phone Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Name"
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--text-primary) mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801..."
                className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
              />
            </div>
          </div>

          {/* Comment / Notes */}
          <div>
            <label className="block text-xs font-semibold text-(--text-primary) mb-1">
              Comment / Notes
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Internal notes..."
              rows={2}
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-(--border-color)">
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
              className="inline-flex items-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-sm hover:opacity-90 transition active:scale-95 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>Assign Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}