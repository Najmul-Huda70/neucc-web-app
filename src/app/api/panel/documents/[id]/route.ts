import { prisma } from "@/lib/prisma";
import { apiError, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction("document:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.document.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.document.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "DOCUMENT_DELETED", targetType: "Document", targetId: id } });
      return true;
    });
    if (!deleted) return apiError(404, "NOT_FOUND", "Document not found.");
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}