import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";
import { ResolutionUpdateSchema } from "@/lib/validation/public";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const auth = await requirePanelAction("resolution:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const resolution = await prisma.resolution.findUnique({ where: { id }, include: { documents: true } });
    if (!resolution) return apiError(404, "NOT_FOUND", "Resolution not found.");
    return ok(resolution);
  } catch {
    return unexpectedError();
  }
}

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction("resolution:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = ResolutionUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid resolution.", parsed.error.flatten());
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.resolution.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const result = await tx.resolution.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "RESOLUTION_UPDATED", targetType: "Resolution", targetId: id } });
      return result;
    });
    if (!updated) return apiError(404, "NOT_FOUND", "Resolution not found.");
    return ok(updated);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction("resolution:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.resolution.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.resolution.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "RESOLUTION_DELETED", targetType: "Resolution", targetId: id } });
      return true;
    });
    if (!deleted) return apiError(404, "NOT_FOUND", "Resolution not found.");
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}