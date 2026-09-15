import { prisma } from "@/lib/prisma";

// GET /api/public/gallery?year=2026&event=IUPC+2026
export async function GET(req: Request) {
  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const eventName = url.searchParams.get("event");

  const items = await prisma.galleryItem.findMany({
    where: {
      ...(year ? { year: Number(year) } : {}),
      ...(eventName ? { eventName: { contains: eventName, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ items });
}
