import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, collection, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";
import { OperationsPaginationSchema, ResolutionCreateSchema } from "@/lib/validation/public";

export async function GET(req: Request) {
  const auth = await requirePanelAction("resolution:manage");
  if (auth.response) return auth.response;
  const parsed = OperationsPaginationSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid resolution filters.", parsed.error.flatten());
  const { page, pageSize, q } = parsed.data;
  const where: Prisma.ResolutionWhereInput = q ? { OR: [{ meetingNo: { contains: q, mode: "insensitive" } }, { memoNo: { contains: q, mode: "insensitive" } }] } : {};
  try {
    const [items, total] = await Promise.all([
      prisma.resolution.findMany({ where, include: { documents: true }, orderBy: { date: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.resolution.count({ where }),
    ]);
    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction("resolution:manage");
  if (auth.response) return auth.response;
  const parsed = ResolutionCreateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid resolution.", parsed.error.flatten());
  try {
    const resolution = await prisma.$transaction(async (tx) => {
      const created = await tx.resolution.create({ data: { ...parsed.data, createdById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "RESOLUTION_CREATED", targetType: "Resolution", targetId: created.id } });
      return created;
    });
    return ok(resolution, { status: 201 });
  } catch {
    return unexpectedError();
  }
}