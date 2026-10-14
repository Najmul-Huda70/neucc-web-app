// Server-safe: types + data shaping for the tiered sponsor grid.

export type SponsorTierKey =
  | "TITLE"
  | "PLATINUM"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "PARTNER";

/** Extended / Partial Shape returned by Prisma queries */
export type SponsorRow = {
  sponsorId: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  eventSponsors?: {
    tier: SponsorTierKey | null;
    displayOrder: number;
    event: { title: string; slug: string };
  }[];
};

export type SponsoredEvent = {
  title: string;
  slug: string;
  tier: SponsorTierKey;
};

export type TieredSponsor = {
  sponsorId: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  /** The highest tier this sponsor holds across all events. */
  tier: SponsorTierKey;
  order: number;
  events: SponsoredEvent[];
};

export type SponsorGroup = {
  key: "premier" | "major" | "community";
  title: string;
  description: string;
  sponsors: TieredSponsor[];
};

export const TIER_LABEL: Record<SponsorTierKey, string> = {
  TITLE: "Title sponsor",
  PLATINUM: "Platinum sponsor",
  GOLD: "Gold sponsor",
  SILVER: "Silver sponsor",
  BRONZE: "Bronze sponsor",
  PARTNER: "Community partner",
};

const TIER_RANK: Record<SponsorTierKey, number> = {
  TITLE: 0,
  PLATINUM: 1,
  GOLD: 2,
  SILVER: 3,
  BRONZE: 4,
  PARTNER: 5,
};

const GROUP_CONFIG: {
  key: SponsorGroup["key"];
  title: string;
  description: string;
  tiers: SponsorTierKey[];
}[] = [
  {
    key: "premier",
    title: "Title and platinum partners",
    description: "The organizations that make our flagship events possible.",
    tiers: ["TITLE", "PLATINUM"],
  },
  {
    key: "major",
    title: "Gold, silver, and bronze sponsors",
    description: "Companies backing our workshops, contests, and seminars.",
    tiers: ["GOLD", "SILVER", "BRONZE"],
  },
  {
    key: "community",
    title: "Community partners",
    description: "Communities and tech partners who help us reach more students.",
    tiers: ["PARTNER"],
  },
];

export function buildTieredSponsors(rows: SponsorRow[]): TieredSponsor[] {
  const seen = new Set<string>();
  const result: TieredSponsor[] = [];

  for (const row of rows) {
    if (seen.has(row.sponsorId)) continue;
    seen.add(row.sponsorId);

    const eventSponsors = row.eventSponsors || [];

    // Safe handling for sponsors without explicit eventSponsors relation
    const tiers = eventSponsors.map((es) => es.tier ?? "PARTNER");
    const best =
      tiers.length > 0
        ? tiers.reduce((a, b) => (TIER_RANK[a] <= TIER_RANK[b] ? a : b))
        : "PARTNER";

    const eventSeen = new Set<string>();
    const events: SponsoredEvent[] = [];
    for (const es of eventSponsors) {
      if (!es.event?.slug || eventSeen.has(es.event.slug)) continue;
      eventSeen.add(es.event.slug);
      events.push({
        title: es.event.title,
        slug: es.event.slug,
        tier: es.tier ?? "PARTNER",
      });
    }

    const minOrder =
      eventSponsors.length > 0
        ? Math.min(...eventSponsors.map((es) => es.displayOrder ?? 0))
        : 0;

    result.push({
      sponsorId: row.sponsorId,
      name: row.name,
      logoUrl: row.logoUrl,
      website: row.website,
      tier: best,
      order: minOrder,
      events,
    });
  }

  return result;
}

export function groupSponsorsByTier(list: TieredSponsor[]): SponsorGroup[] {
  const sorted = [...list].sort(
    (a, b) =>
      TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
      a.order - b.order ||
      a.name.localeCompare(b.name),
  );

  return GROUP_CONFIG.map(({ tiers, ...group }) => ({
    ...group,
    sponsors: sorted.filter((s) => tiers.includes(s.tier)),
  })).filter((g) => g.sponsors.length > 0);
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}