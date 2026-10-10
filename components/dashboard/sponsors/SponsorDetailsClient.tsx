"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Trash2, Globe, Mail, Phone, MessageSquare, Building2 } from "lucide-react";
import EditEventSponsorModal from "./EditEventSponsorModal";
import DeleteEventSponsorModal from "./DeleteEventSponsorModal";
import EditCompanyModal from "./EditCompanyModal";
import AssignEventSponsorModal from "./AssignEventSponsorModal";

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

type SponsorDetails = {
  sponsorId: string;
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  eventSponsors: EventSponsorItem[];
};

export default function SponsorDetailsClient({ initialSponsor }: { initialSponsor: SponsorDetails }) {
  const router = useRouter();
  const [sponsor, setSponsor] = useState<SponsorDetails>(initialSponsor);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals States
  const [selectedEditEventSponsor, setSelectedEditEventSponsor] = useState<any | null>(null);
  const [selectedDeleteEventSponsor, setSelectedDeleteEventSponsor] = useState<{ id: string; title: string } | null>(null);
  const [isCompanyDeleteOpen, setIsCompanyDeleteOpen] = useState(false);
  const [isCompanyEditOpen, setIsCompanyEditOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [companyDeleteTyped, setCompanyDeleteTyped] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredEventSponsors = useMemo(() => {
    if (!searchQuery.trim()) return sponsor.eventSponsors;
    return sponsor.eventSponsors.filter((es) =>
      es.event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sponsor.eventSponsors, searchQuery]);

  // ----------------------------------------------------
  // Instant / Optimistic Handlers (No Page Refresh Loading)
  // ----------------------------------------------------

  // ১. কোম্পানি এডিট হলে লোডিং ছাড়া ইনস্ট্যান্ট স্টেট আপডেট
  const handleCompanyUpdateSuccess = (updatedCompany: { name: string; logoUrl?: string | null; website?: string | null }) => {
    setSponsor((prev) => ({
      ...prev,
      name: updatedCompany.name,
      logoUrl: updatedCompany.logoUrl,
      website: updatedCompany.website,
    }));
    router.refresh(); // ব্যাকগ্রাউন্ডে সার্ভার সিঙ্ক
  };

  // ২. নতুন ইভেন্ট স্পন্সর যোগ হলে ইনস্ট্যান্ট স্টেট আপডেট
  const handleAssignSuccess = (newEventSponsor: EventSponsorItem) => {
    setSponsor((prev) => ({
      ...prev,
      eventSponsors: [newEventSponsor, ...prev.eventSponsors],
    }));
    router.refresh(); // ব্যাকগ্রাউন্ডে সার্ভার সিঙ্ক
  };

  // ৩. ইভেন্ট স্পন্সর এডিট হলে ইনস্ট্যান্ট স্টেট আপডেট
  const handleEditEventSponsorSuccess = (updatedItem: EventSponsorItem) => {
    setSponsor((prev) => ({
      ...prev,
      eventSponsors: prev.eventSponsors.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ),
    }));
    router.refresh(); // ব্যাকগ্রাউন্ডে সার্ভার সিঙ্ক
  };

  // ৪. ইভেন্ট স্পন্সর ডিলিট হলে ইনস্ট্যান্ট স্টেট থেকে রিমুভ
  const handleDeleteEventSponsorConfirm = async () => {
    if (!selectedDeleteEventSponsor) return;
    const deletedId = selectedDeleteEventSponsor.id;

    // লোডিং ছাড়াই ইউআই থেকে রিমুভ
    setSponsor((prev) => ({
      ...prev,
      eventSponsors: prev.eventSponsors.filter((item) => item.id !== deletedId),
    }));

    await fetch(`/api/event-sponsors?id=${deletedId}`, { method: "DELETE" });
    router.refresh(); // ব্যাকগ্রাউন্ডে সার্ভার সিঙ্ক
  };

  const handleCompanyDelete = async () => {
    if (companyDeleteTyped !== sponsor.name) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/sponsors/${sponsor.sponsorId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/sponsors");
      } else {
        alert(data.message || "Failed to delete company.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsCompanyDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-(--card-bg) border border-(--border-color) p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          {sponsor.logoUrl ? (
            <img src={sponsor.logoUrl} alt={sponsor.name} className="w-14 h-14 object-cover rounded-xl border border-(--border-color)" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-(--stat-card-bg) border border-(--border-color) flex items-center justify-center text-(--text-muted)">
              <Building2 size={24} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-(--text-primary)">{sponsor.name}</h1>
            {sponsor.website && (
              <a href={sponsor.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline mt-1">
                <Globe size={13} />
                <span>{sponsor.website}</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCompanyEditOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--card-bg) px-4 py-2 text-xs font-semibold text-(--text-primary) hover:bg-(--stat-card-bg) transition"
          >
            <Edit2 size={14} />
            <span>Edit Company</span>
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search by event title..."
            className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 pl-10 pr-4 text-xs text-(--text-primary) focus:border-(--btn-primary-bg) focus:outline-none"
          />
        </div>

        <button
          onClick={() => setIsAssignModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-(--btn-primary-bg) px-4 py-2 text-xs font-semibold text-(--btn-primary-text) shadow-sm hover:opacity-90 transition"
        >
          <Plus size={15} />
          <span>+ New Sponsor</span>
        </button>
      </div>

      {/* List / Empty State */}
      {sponsor.eventSponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-color) bg-(--card-bg) p-12 text-center space-y-4">
          <div className="rounded-full bg-(--stat-card-bg) p-4 text-(--text-muted)">
            <Building2 size={32} />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-sm font-bold text-(--text-primary)">No Event Sponsorships Found</h3>
            <p className="text-xs text-(--text-secondary)">
              This company is not currently linked to any events.
            </p>
          </div>
          <button
            onClick={() => setIsCompanyDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition"
          >
            <Trash2 size={14} />
            <span>Delete Company</span>
          </button>
        </div>
      ) : filteredEventSponsors.length === 0 ? (
        <div className="p-8 text-center text-xs text-(--text-muted)">
          No events match your search query &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEventSponsors.map((es) => (
            <div key={es.id} className="rounded-2xl border border-(--border-color) bg-(--card-bg) p-5 shadow-xs space-y-4 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-(--text-primary)">{es.event.title}</h3>
                  {es.tier && (
                    <span className="inline-block rounded-lg bg-(--stat-card-bg) border border-(--border-color) px-2.5 py-0.5 text-[10px] font-bold text-(--text-primary) tracking-wide">
                      {es.tier.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEditEventSponsor(es)}
                    className="inline-flex items-center gap-1 rounded-lg border border-(--border-color) px-3 py-1 text-xs font-semibold text-(--text-primary) hover:bg-(--stat-card-bg) transition"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setSelectedDeleteEventSponsor({ id: es.id, title: es.event.title })}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-(--border-color) text-xs text-(--text-secondary)">
                <div><span className="font-semibold text-(--text-primary)">Contact:</span> {es.contactPerson || "N/A"}</div>
                <div className="flex items-center gap-1.5"><Mail size={13} /> {es.email || "N/A"}</div>
                <div className="flex items-center gap-1.5"><Phone size={13} /> {es.phone || "N/A"}</div>
              </div>

              {es.comment && (
                <div className="flex items-start gap-2 rounded-xl bg-(--stat-card-bg) p-3 text-xs text-(--text-secondary) border border-(--border-color)">
                  <MessageSquare size={14} className="mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{es.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals with Instant Updates */}
      <EditCompanyModal
        isOpen={isCompanyEditOpen}
        onClose={() => setIsCompanyEditOpen(false)}
        onSuccess={handleCompanyUpdateSuccess}
        sponsor={sponsor}
      />

      <AssignEventSponsorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        sponsorId={sponsor.sponsorId}
      />

      <EditEventSponsorModal
        isOpen={!!selectedEditEventSponsor}
        onClose={() => setSelectedEditEventSponsor(null)}
        onSuccess={handleEditEventSponsorSuccess}
        sponsorData={selectedEditEventSponsor}
      />

      <DeleteEventSponsorModal
        isOpen={!!selectedDeleteEventSponsor}
        onClose={() => setSelectedDeleteEventSponsor(null)}
        eventTitle={selectedDeleteEventSponsor?.title || ""}
        onConfirm={handleDeleteEventSponsorConfirm}
      />

      {/* Delete Company Modal */}
      {isCompanyDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--bg-app) p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-red-500">Delete Company Profile</h2>
            <p className="text-xs text-(--text-secondary)">Type <strong className="text-(--text-primary)">{sponsor.name}</strong> to confirm deletion.</p>
            <input
              type="text"
              value={companyDeleteTyped}
              onChange={(e) => setCompanyDeleteTyped(e.target.value)}
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg) py-2 px-3 text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setIsCompanyDeleteOpen(false)} className="px-4 py-2 text-xs">Cancel</button>
              <button
                disabled={companyDeleteTyped !== sponsor.name || loading}
                onClick={handleCompanyDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}