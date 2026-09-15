import { prisma } from "@/lib/prisma";

// GET /api/public/announcements?page=1&pageSize=15
// Critically: only NoticeScope.GENERAL is ever exposed here. Internal and
// Election-scope notices must never reach this endpoint, per SRS §6.3.4 —
// the `scope: "GENERAL"` filter below is not optional.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize") ?? 15)));

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
