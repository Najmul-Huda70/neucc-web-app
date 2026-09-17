import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, collection, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";
import { DocumentCreateSchema, OperationsPaginationSchema } from "@/lib/validation/public";

export async function GET(req: Request) {
  const auth = await requirePanelAction("document:manage");
  if (auth.response) return auth.response;
  const parsed = OperationsPaginationSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid document filters.", parsed.error.flatten());
  const { page, pageSize, q } = parsed.data;
  const where: Prisma.DocumentWhereInput = q ? { title: { contains: q, mode: "insensitive" } } : {};
  try {
    const [items, total] = await Promise.all([
      prisma.document.findMany({ where, include: { notice: true, resolution: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.document.count({ where }),
    ]);
    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction("document:manage");
  if (auth.response) return auth.response;
  const parsed = DocumentCreateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid document.", parsed.error.flatten());
  const { noticeId, resolutionId, ...data } = parsed.data;
  try {
    const document = await prisma.$transaction(async (tx) => {
      if (noticeId && !(await tx.notice.findUnique({ where: { id: noticeId }, select: { id: true } }))) return null;
      if (resolutionId && !(await tx.resolution.findUnique({ where: { id: resolutionId }, select: { id: true } }))) return null;
      const created = await tx.document.create({ data: { ...data, noticeId, resolutionId, uploadedById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "DOCUMENT_CREATED", targetType: "Document", targetId: created.id } });
      return created;
    });
    if (!document) return apiError(404, "NOT_FOUND", "The selected notice or resolution was not found.");
    return ok(document, { status: 201 });
  } catch {
    return unexpectedError();
  }
}