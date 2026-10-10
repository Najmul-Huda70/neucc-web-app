"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Crown,
  Medal,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type SponsorTierEnum = "TITLE" | "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "PARTNER";

type TierConfig = {
  tier: SponsorTierEnum;
  name: string;
  price: string;
  slots?: string;
  badge?: string;
  recommended?: boolean;
  icon: LucideIcon;
  iconClass: string;
  features: string[];
};

const TIERS: TierConfig[] = [
  {
    tier: "TITLE",
    name: "Title Sponsor",
    price: "৳250,000",
    badge: "RECOMMENDED",
    slots: "1 SLOT ONLY",
    recommended: true,
    icon: Crown,
    iconClass: "bg-(--badge-bg) text-(--badge-text)",
    features: [
      'Exclusive "Title Sponsor" recognition across event',
      "Logo on all backdrops, side-drops, banners, & t-shirts",
      "5 VIP invitations to inaugural & prize ceremonies",
      "Exclusive 15-minute keynote / product demo slot",
      "Dedicated social media campaign & press release",
      "Logo on certificates, platform & event merchandise",
    ],
  },
  {
    tier: "PLATINUM",
    name: "Platinum Sponsor",
    price: "৳180,000",
    slots: "2 SLOTS",
    icon: Award,
    iconClass: "bg-(--stat-card-bg) text-(--btn-primary-bg)",
    features: [
      'Official "In Association with" sponsor status',
      "Logo on backdrops, banners, posters, & t-shirts",
      "3 VIP invitations to key event sessions",
      "Branding in media coverage & digital promotions",
      "Dedicated social media shoutout campaign",
      "10-minute presentation or speaking slot",
    ],
  },
  {
    tier: "GOLD",
    name: "Gold Sponsor",
    price: "৳120,000",
    slots: "3 SLOTS",
    icon: Medal,
    iconClass: "bg-amber-500/10 text-(--accent)",
    features: [
      "Logo on main backdrops, posters, & digital ads",
      "2 VIP invitations to the event",
      "Digital promotions & social media shoutouts",
      "Logo placement on official website & certificates",
      "Stall / booth space in campus during event",
    ],
  },
  {
    tier: "SILVER",
    name: "Silver Sponsor",
    price: "৳80,000",
    slots: "4 SLOTS",
    icon: Medal,
    iconClass: "bg-(--stat-card-bg) text-(--text-muted)",
    features: [
      "Logo on banners, posters, & social media posts",
      "2 VIP invitations to the event",
      "Branding in official digital campaigns",
      "Logo listed in website sponsor gallery",
    ],
  },
  {
    tier: "BRONZE",
    name: "Bronze Sponsor",
    price: "৳40,000",
    slots: "5 SLOTS",
    icon: Shield,
    iconClass: "bg-amber-700/10 text-amber-700",
    features: [
      "Logo placement on posters & promotional posts",
      "1 VIP invitation to the event",
      "Branding in digital campaign materials",
      "Logo featured on official club website",
    ],
  },
  {
    tier: "PARTNER",
    name: "Official Partner",
    price: "Custom / In-Kind",
    slots: "LIMITED",
    icon: Sparkles,
    iconClass: "bg-(--stat-card-bg) text-(--btn-primary-bg)",
    features: [
      "Category Partner (Food, Media, Tech, Logistics)",
      "Logo on campaign banners & event website",
      "Dedicated social media partner announcement",
      "Official Certificate of Appreciation",
    ],
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay: i * 0.06 },
  }),
};

export default function SponsorshipTiers() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? "visible" : "hidden";

  return (
    <section id="sponsorship-tiers" className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="mx-auto mb-10 max-w-xl space-y-2 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-(--text-primary)">
          Choose Your <span className="text-(--text-secondary)">Sponsorship Tier</span>
        </h2>
        <p className="text-xs md:text-sm text-(--text-muted) leading-relaxed">
          Select the package that fits your brand&apos;s goals and budget. Every tier delivers real, measurable impact.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isFeatured = tier.recommended;

          return (
            <motion.div
              key={tier.tier}
              custom={i}
              variants={cardVariants}
              initial={initial}
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 bg-(--card-bg) transition-all duration-300 ${
                isFeatured
                  ? "border-(--btn-primary-bg) shadow-lg ring-2 ring-(--btn-primary-bg)/20"
                  : "border-(--border-color) hover:border-(--btn-primary-bg) hover:bg-(--card-hover) shadow-2xs"
              }`}
            >
              <div>
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-4 min-h-[24px]">
                  {tier.badge ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-(--badge-bg) border border-(--badge-text)/20 px-2.5 py-0.5 text-[10px] font-bold text-(--badge-text) tracking-wider">
                      <Sparkles size={11} />
                      {tier.badge}
                    </span>
                  ) : (
                    <div />
                  )}

                  {tier.slots && (
                    <span className="rounded-full border border-(--border-color) bg-(--stat-card-bg) px-2.5 py-0.5 text-[10px] font-bold text-(--text-muted) tracking-wider">
                      {tier.slots}
                    </span>
                  )}
                </div>

                {/* Icon, Title & Price */}
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tier.iconClass} border border-(--border-color)`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-(--text-primary)">{tier.name}</h3>
                    <p className="text-xl sm:text-2xl font-extrabold text-(--text-primary) tracking-tight">
                      {tier.price}
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-(--border-color)" />

                {/* Features List */}
                <ul className="space-y-2.5 text-xs">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={15}
                        className={`shrink-0 mt-0.5 ${
                          isFeatured ? "text-(--btn-primary-bg)" : "text-(--text-muted)"
                        }`}
                      />
                      <span className="text-xs leading-normal text-(--text-primary)">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA Button */}
              <div className="pt-6 mt-6 border-t border-(--border-color)">
                <a
                  href="#contact-us"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition active:scale-95 ${
                    isFeatured
                      ? "bg-(--btn-primary-bg) hover:opacity-90 text-(--btn-primary-text) shadow-md"
                      : "bg-(--stat-card-bg) hover:bg-(--btn-primary-bg) hover:text-(--btn-primary-text) text-(--text-primary) border border-(--btn-secondary-border)"
                  }`}
                >
                  <span>Become a {tier.name}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}