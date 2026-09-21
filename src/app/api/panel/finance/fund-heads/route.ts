import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, ok, unexpectedError } from '@/lib/http/api-response';
import { requireUser } from '@/lib/auth/session';
import { can } from '@/lib/auth/permissions';
import { FundHeadCreateSchema } from '@/lib/validation/public';

// GET /api/panel/finance/fund-heads — anyone with finance visibility (Treasurer or President oversight).
// No pagination: a club realistically has a handful of fund heads, not pages of them.
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, 'finance:manage') && !can(auth.user, 'finance:view_oversight')) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to view finance records.');
  }

  try {
    const fundHeads = await prisma.fundHead.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] });
    return ok(fundHeads);
  } catch {
    return unexpectedError();
  }
}

// POST /api/panel/finance/fund-heads — Treasurer only. This is what the
// original codebase was missing entirely: fund heads could only ever come
// from prisma/seed.ts, with no way for a Treasurer to add a new
// income/expense category without a database edit.
export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  if (!can(auth.user, 'finance:manage')) {
    return apiError(403, 'FORBIDDEN', 'You do not have permission to manage finance records.');
  }

  const parsed = FundHeadCreateSchema.safeParse(await readJsonBody(req));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid fund head.', parsed.error.flatten());

  try {
    const fundHead = await prisma.fundHead.create({ data: parsed.data });
    return ok(fundHead, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return apiError(409, 'DUPLICATE_FUND_HEAD', 'A fund head with this name and type already exists.');
    }
    return unexpectedError();
  }
}
