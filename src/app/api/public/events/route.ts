import { prisma } from "@/lib/prisma";
import { parsePublicQuery, PublicEventsQuerySchema } from "@/lib/validation/public";
import type { Prisma } from "@prisma/client";

// GET /api/public/events?status=UPCOMING&category=WORKSHOP&q=hackathon&page=1&pageSize=10
export async function GET(req: Request) {
  const parsed = parsePublicQuery(PublicEventsQuerySchema, req);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, category, q, page, pageSize } = parsed.data;

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
