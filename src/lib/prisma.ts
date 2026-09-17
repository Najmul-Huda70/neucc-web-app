import { PrismaClient } from "@prisma/client";
import {
  fallbackAchievements,
  fallbackCommittees,
  fallbackContests,
  fallbackEvents,
  fallbackGallery,
  fallbackNotices,
  fallbackSiteContent,
  fallbackSponsors,
} from "@/lib/fallback-data";

const fallbackModelMap = {
  achievement: fallbackAchievements,
  committee: fallbackCommittees,
  contest: fallbackContests,
  event: fallbackEvents,
  galleryItem: fallbackGallery,
  notice: fallbackNotices,
  siteContent: fallbackSiteContent,
  sponsor: fallbackSponsors,
} as const;

const resolveFallbackValue = (model: string, method: string, args: unknown[] = []) => {
  const list = fallbackModelMap[model as keyof typeof fallbackModelMap] ?? [];

  if (method === "findMany") {
    return list;
  }

  if (method === "findFirst") {
    return list[0] ?? null;
  }

  if (method === "findUnique") {
    const payload = args[0] as { where?: Record<string, unknown> } | undefined;
    const where = payload?.where ?? {};
    const key = where.key;

    if (typeof key === "string") {
      return (list as Array<{ key?: string }>).find((item) => item.key === key) ?? null;
    }

    return list[0] ?? null;
  }

  if (method === "count") {
    return list.length;
  }

  if (method === "create") {
    const payload = args[0] as { data?: Record<string, unknown> } | undefined;
    const data = payload?.data ?? {};
    return { id: crypto.randomUUID(), ...data };
  }

  return list;
};

const fallbackPrisma = new Proxy(
  {},
  {
    get(_target, modelName) {
      if (typeof modelName !== "string") {
        return undefined;
      }

      return new Proxy(
        function () {},
        {
          get(_methodTarget, methodName) {
            if (typeof methodName !== "string") {
              return undefined;
            }

            return (...args: unknown[]) => resolveFallbackValue(modelName, methodName, args);
          },
        },
      );
    },
  },
);

// Prevents "too many connections" in dev when Next.js hot-reloads modules.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const shouldUseFallback = !process.env.DATABASE_URL;

export const prisma = shouldUseFallback
  ? (fallbackPrisma as unknown as PrismaClient)
  : (globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }));

if (!shouldUseFallback && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
