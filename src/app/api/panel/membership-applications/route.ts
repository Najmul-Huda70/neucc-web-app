import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiError, collection, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { OperationsPaginationSchema } from '@/lib/validation/public';

const QuerySchema = OperationsPaginationSchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

// GET /api/panel/membership-applications?status=PENDING&q=&page=&pageSize=
//
// Closes a gap from the original audit: Join Us submissions
// (`MembershipApplication`) could be created via the public form but had
// no panel route to review them — every submission sat at PENDING forever
// with no way to approve or reject it. Scope decision (no post is named
// for this in the SRS): gated to President or General Secretary, the same
// as contact-messages — see docs/STEP_10_CHANGELOG.md.
export async function GET(req: Request) {
  const auth = await requirePanelAction('membership:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid filters.', parsed.error.flatten());

  const { page, pageSize, q, status } = parsed.data;
  const where: Prisma.MembershipApplicationWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { studentId: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  try {
    const [items, total] = await Promise.all([
      prisma.membershipApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.membershipApplication.count({ where }),
    ]);
    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}
