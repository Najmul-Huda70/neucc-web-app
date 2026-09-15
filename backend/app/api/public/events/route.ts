import { prisma } from "@/lib/prisma";
import type { EventCategory, EventStatus, Prisma } from "@prisma/client";

// GET /api/public/events?status=UPCOMING&category=WORKSHOP&q=hackathon&page=1&pageSize=10
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as EventStatus | null;
  const category = url.searchParams.get("category") as EventCategory | null;
  const q = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 12)));

  const where: Prisma.EventWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);

  return Response.json({
    events,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
