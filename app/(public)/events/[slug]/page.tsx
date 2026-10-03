"use client";

import { ExternalLink, ImageIcon, Loader2, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EventHeader from "@/components/events/EventHeader";
import EventCard, { type PublicEventCardData } from "@/components/public/events/EventCard";

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
  committee: { type: string; year: number };
  eventSponsors: PublicEventSponsor[];
  galleries: PublicEventGallery[];
  relatedEvents: PublicEventCardData[];
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
  <div className="min-h-[calc(100vh-8rem)] bg-(--bg-app) px-4 py-6 text-(--text-primary) sm:px-6 lg:py-8">
    <div className="mx-auto w-full max-w-7xl">
      <motion.article 
        initial={{ opacity: 0, y: 22 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.55 }} 
        className="overflow-hidden rounded-2xl bg-(--card-bg)"
      >
        <EventHeader title={event.title} shortDescription={event.shortDescription} type={event.type} detailBannerUrl={event.detailBannerUrl} committee={event.committee} />

        <div className="p-5 sm:p-8">
          <div className=" space-y-6 border-t border-gray-100/10">
            {/* Markdown Description */}
            <motion.section 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true, amount: 0.2 }} 
              transition={{ duration: 0.4 }}
            >
              <article className="event-markdown mx-0! max-w-3xl! text-left">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {event.description}
                </ReactMarkdown>
              </article>
            </motion.section>

            {/* Sponsors Section */}
            {event.eventSponsors.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.4 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <UsersRound size={16} className="text-(--btn-primary-bg)" />
                  <h2 className="text-base font-black">Supported by</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {event.eventSponsors.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl bg-(--stat-card-bg) p-3">
                      {item.sponsor.logoUrl ? (
                        <Image src={item.sponsor.logoUrl} alt="" width={42} height={42} unoptimized className="h-10 w-10 rounded-lg object-contain" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--card-bg) text-xs font-black text-(--btn-primary-bg)">
                          {item.sponsor.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{item.sponsor.name}</p>
                        <p className="text-[11px] text-(--text-secondary)">{item.tier || "Partner"}</p>
                      </div>
                      {item.sponsor.website && (
                        <a href={item.sponsor.website} target="_blank" rel="noreferrer" aria-label={`Visit ${item.sponsor.name}`} className="ml-auto text-(--text-secondary) hover:text-(--btn-primary-bg)">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Gallery Section */}
            {event.galleries.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.4 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-(--btn-primary-bg)" />
                  <h2 className="text-base font-black">Event gallery</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.galleries.map((image) => (
                    <figure key={image.galleryId} className="group overflow-hidden rounded-xl bg-(--stat-card-bg)">
                      <div className="relative aspect-square overflow-hidden">
                        <Image src={image.imageUrl} alt={image.caption || event.title} fill unoptimized sizes="(max-width: 640px) 50vw, 300px" className="object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      {(image.caption || image.location) && (
                        <figcaption className="p-2 text-[11px] text-(--text-secondary)">{image.caption || image.location}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </motion.article>

      {/* Related Events */}
      {event.relatedEvents.length > 0 && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, amount: 0.15 }} 
          transition={{ duration: 0.5 }} 
          className="mt-8"
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--btn-primary-bg)">Keep exploring</p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">More {event.type.toLowerCase()} events</h2>
            </div>
            <Link href={`/events?type=${event.type}`} className="hidden text-xs font-bold text-(--text-secondary) hover:text-(--btn-primary-bg) sm:block">
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.relatedEvents.slice(0, 3).map((related, index) => (
              <motion.div key={related.eventId} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: index * 0.08 }}>
                <EventCard event={related} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  </div>
)
};