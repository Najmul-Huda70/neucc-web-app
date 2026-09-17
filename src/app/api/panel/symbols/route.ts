import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { SymbolCreateSchema, SymbolQuerySchema } from '@/lib/validation/public';

export async function GET(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = SymbolQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid symbol filters.', parsed.error.flatten());

  const { page, pageSize, q } = parsed.data;
  const where: Prisma.SymbolWhereInput = q ? { name: { contains: q, mode: 'insensitive' } } : {};

  try {
    const [items, total] = await Promise.all([
      prisma.symbol.findMany({ where, include: { candidates: true }, orderBy: { name: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.symbol.count({ where }),
    ]);

    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

export async function POST(req: Request) {
  const auth = await requirePanelAction('election:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = SymbolCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid symbol payload.', parsed.error.flatten());

  try {
    const symbol = await prisma.$transaction(async (tx) => {
      const created = await tx.symbol.create({ data: parsed.data });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'SYMBOL_CREATED',
          targetType: 'Symbol',
          targetId: created.id,
        },
      });
      return created;
    });

    return ok(symbol, { status: 201 });
  } catch {
    return unexpectedError();
  }
}
