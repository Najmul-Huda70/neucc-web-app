"use client";

import { AlertTriangle, Clock3, Info, Loader2, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EventHeader from "@/components/events/EventHeader";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";
import EditorialGallery from "@/components/public/events/EditorialGallery";

type PublicEventSponsor = {
  id: string;
  tier?: string | null;
  sponsor: { sponsorId: string; name: string; logoUrl?: string | null; website?: string | null };
};

type PublicEventGallery = { galleryId: string; imageUrl: string; caption?: string | null; location?: string | null };

type PublicEventDetail = {
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  status: string;
  detailBannerUrl?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  vanue?: string | null;
  committee: { type: string; year: number };
  eventSponsors: PublicEventSponsor[];
  galleries: PublicEventGallery[];
  relatedEvents: PublicEventCardData[];
};

function getMarkdownHeadingMeta(children: ReactNode) {
  const text = String(children).toLowerCase();
  if (text.includes("schedule") || text.includes("time")) return { icon: Clock3, className: "event-markdown-heading--schedule" };
  if (text.includes("rule") || text.includes("warning")) return { icon: AlertTriangle, className: "event-markdown-heading--rules" };
  return { icon: Info, className: "event-markdown-heading--default" };
}

const markdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => {
    const { icon: Icon, className } = getMarkdownHeadingMeta(children);
    return <h2 className={`event-markdown-section-heading ${className}`}><Icon size={18} aria-hidden="true" /><span>{children}</span></h2>;
  },
  h3: ({ children }: { children?: ReactNode }) => <h3 className="event-markdown-subheading">{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="event-markdown-paragraph">{children}</p>,
};

export default function PublicEventDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<PublicEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await fetch(`/api/events/${slug}`);
        const data = await response.json();
        if (!response.ok || data.data?.status !== "PUBLISHED") throw new Error("Event not found.");
        setEvent(data.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load event.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug]);

  if (loading) return <div className="flex items-center justify-center gap-3 py-24 text-sm text-(--text-secondary)"><Loader2 className="animate-spin" /> Loading event...</div>;
  if (error || !event) return <div className="mx-auto max-w-5xl px-4 py-16"><p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700">{error || "Event not found."}</p></div>;

  return (
    <div className="min-h-screen bg-[#f3f1eb] text-[#202522]">
      <motion.article
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className="overflow-hidden bg-[#fffdfa]"
      >
        <EventHeader
          title={event.title}
          shortDescription={event.shortDescription}
          type={event.type}
          status={event.status}
          detailBannerUrl={event.detailBannerUrl}
          committee={event.committee}
          startDate={event.startDate}
          endDate={event.endDate}
          vanue={event.vanue}
        />
        <div className="mx-auto w-full max-w-360 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-20">
            {/* Markdown Description */}
            <motion.section
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <article className="event-markdown event-markdown-editorial mx-0! max-w-3xl! text-left">
                <div className="mb-8 flex items-center gap-3 border-b border-[#d9d5cc] pb-4">
                  <span className="h-2 w-2 rounded-full bg-[#9b744e]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9b744e]">Event details</p>
                </div>
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{event.description}</ReactMarkdown>
              </article>
            </motion.section>

            <aside className="self-start border-t border-[#d9d5cc] pt-6 lg:sticky lg:top-8 lg:border-t-0 lg:border-l lg:pl-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">At a glance</p>
              <dl className="mt-5 divide-y divide-[#e4e0d7] border-y border-[#e4e0d7]">
                <div className="py-4"><dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">Event type</dt><dd className="mt-1 text-sm font-bold">{event.type}</dd></div>
                <div className="py-4"><dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">Committee</dt><dd className="mt-1 text-sm font-bold">{event.committee.type}<span className="font-normal text-[#7a817b]"> · {event.committee.year}</span></dd></div>
                <div className="py-4"><dt className="text-[11px] uppercase tracking-[0.14em] text-[#7a817b]">Status</dt><dd className="mt-1 inline-flex items-center gap-2 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-[#288c83]" />{event.status}</dd></div>
              </dl>
            </aside>
          </div>

          {/* Sponsors Section */}
          {event.eventSponsors.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-5 flex items-center gap-3 border-t border-[#d9d5cc] pt-16">
                <UsersRound size={17} className="text-[#9b744e]" />
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">Partners</p><h2 className="font-serif text-2xl">Supported by</h2></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {event.eventSponsors.map((item) => (
                  <div key={item.id} className="group flex items-center justify-center border border-[#e2ded6] bg-[#faf8f3] p-5 transition-colors hover:border-[#b99a73] hover:bg-[#f4eee5]">
                    <div className="min-w-0 text-center">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b744e]">{item.tier || "Partner"}</p>
                      <div className="group relative flex h-16 w-36 items-center justify-center" title={item.sponsor.name}>
                        {item.sponsor.logoUrl ? <Image src={item.sponsor.logoUrl} alt={item.sponsor.name} width={120} height={48} unoptimized className="max-h-12 w-auto max-w-32 object-contain" /> : <span className="text-xs text-(--text-secondary)">Logo unavailable</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          <div className="mt-16 border-t border-[#d9d5cc] pt-10"><EditorialGallery images={event.galleries} /></div>
        </div>
      </motion.article>

      {/* Related Events */}
      {event.relatedEvents.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-8 w-full max-w-1440px px-5 pb-16 sm:px-10 lg:px-16"
        >
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#d9d5cc] pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b744e]">Keep exploring</p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">More {event.type.toLowerCase()} events</h2>
            </div>
            <Link href={`/events?type=${event.type}`} className="hidden text-xs font-bold text-(--text-secondary) hover:text-(--btn-primary-bg) sm:block">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.relatedEvents.slice(0, 3).map((related, index) => (
              <motion.div key={related.eventId} initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: index * 0.08 }}>
                <EventCard event={related} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}