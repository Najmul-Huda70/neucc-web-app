import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, ok, unexpectedError } from "@/lib/http/api-response";
import { requirePanelAction } from "@/lib/auth/panel-route";
import { FinanceTransactionUpdateSchema } from "@/lib/validation/public";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const auth = await requirePanelAction("finance:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = FinanceTransactionUpdateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid finance transaction.", parsed.error.flatten());
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id }, include: { fundHead: true } });
      if (!existing) return null;
      if (parsed.data.fundHeadId || parsed.data.type) {
        const fundHead = await tx.fundHead.findUnique({ where: { id: parsed.data.fundHeadId ?? existing.fundHeadId } });
        if (!fundHead || fundHead.type !== (parsed.data.type ?? existing.type)) return "invalid" as const;
      }
      const result = await tx.transaction.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "TRANSACTION_UPDATED", targetType: "Transaction", targetId: id } });
      return result;
    });
    if (updated === null) return apiError(404, "NOT_FOUND", "Transaction not found.");
    if (updated === "invalid") return apiError(422, "VALIDATION_ERROR", "The fund head does not match the transaction type.");
    return ok(updated);
  } catch {
    return unexpectedError();
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  const auth = await requirePanelAction("finance:manage");
  if (auth.response) return auth.response;
  const { id } = await params;
  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return false;
      await tx.transaction.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "TRANSACTION_DELETED", targetType: "Transaction", targetId: id } });
      return true;
    });
    if (!deleted) return apiError(404, "NOT_FOUND", "Transaction not found.");
    return ok({ id });
  } catch {
    return unexpectedError();
  }
}