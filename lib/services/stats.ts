import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

async function fetchHomeStats() {
  try {
    const [members, eventsHosted, firstCommittee, sponsorsCount] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.events.count({
        where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
      }),
      prisma.committee.aggregate({ _min: { year: true } }),
      prisma.sponsor.count({
        where: { eventSponsors: { some: { isPublic: true } } },
      }),
    ]);

    const firstYear = firstCommittee._min.year ?? new Date().getFullYear();
    const yearsActive = Math.max(1, new Date().getFullYear() - firstYear + 1);

    return {
      members,
      eventsHosted,
      yearsActive,
      sponsorsCount,
    };
  } catch (error) {
    console.error("Error fetching home stats:", error);
    return { members: 0, eventsHosted: 0, yearsActive: 1, sponsorsCount: 0 };
  }
}

// Cached Home Stats (30 Minutes Cache)
export const getCachedHomeStats = unstable_cache(
  async () => fetchHomeStats(),
  ["home-stats-cache"],
  {
    revalidate: 1800, // 30 minutes
    tags: ["stats", "users", "events", "sponsors", "committee"],
  }
);