import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/http/request";
import { apiError, collection, ok, unexpectedError } from "@/lib/http/api-response";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { FinanceTransactionCreateSchema, OperationsPaginationSchema } from "@/lib/validation/public";

export async function GET(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, "finance:manage") && !can(auth.user, "finance:view_oversight")) return apiError(403, "FORBIDDEN", "You do not have permission to view finance records.");
  const parsed = OperationsPaginationSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid finance filters.", parsed.error.flatten());
  const { page, pageSize, q } = parsed.data;
  const where: Prisma.TransactionWhereInput = q ? { OR: [{ description: { contains: q, mode: "insensitive" } }, { memberName: { contains: q, mode: "insensitive" } }] } : {};
  try {
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({ where, include: { fundHead: true }, orderBy: { date: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.transaction.count({ where }),
    ]);
    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, "finance:manage")) return apiError(403, "FORBIDDEN", "You do not have permission to manage finance records.");
  const parsed = FinanceTransactionCreateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, "VALIDATION_ERROR", "Invalid finance transaction.", parsed.error.flatten());
  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const fundHead = await tx.fundHead.findUnique({ where: { id: parsed.data.fundHeadId } });
      if (!fundHead || fundHead.type !== parsed.data.type) return null;
      const created = await tx.transaction.create({ data: { ...parsed.data, createdById: auth.user.id } });
      await tx.auditLog.create({ data: { actorId: auth.user.id, action: "TRANSACTION_CREATED", targetType: "Transaction", targetId: created.id } });
      return created;
    });
    if (!transaction) return apiError(422, "VALIDATION_ERROR", "The fund head does not match the transaction type.");
    return ok(transaction, { status: 201 });
  } catch {
    return unexpectedError();
  }
}