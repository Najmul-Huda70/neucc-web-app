import { prisma } from "@/lib/prisma";
import { parsePublicQuery, PublicAnnouncementsQuerySchema } from "@/lib/validation/public";

// GET /api/public/announcements?page=1&pageSize=15
// Critically: only NoticeScope.GENERAL is ever exposed here. Internal and
// Election-scope notices must never reach this endpoint, per SRS §6.3.4 —
// the `scope: "GENERAL"` filter below is not optional.
export async function GET(req: Request) {
  const parsed = parsePublicQuery(PublicAnnouncementsQuerySchema, req);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, pageSize } = parsed.data;

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: { scope: "GENERAL" },
      orderBy: [{ isPinned: "desc" }, { date: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        subject: true,
        body: true,
        date: true,
        memoNo: true,
        pdfUrl: true,
        isPinned: true,
      },
    }),
    prisma.notice.count({ where: { scope: "GENERAL" } }),
  ]);

  return Response.json({
    notices,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
