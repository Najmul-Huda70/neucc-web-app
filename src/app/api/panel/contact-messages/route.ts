import { prisma } from '@/lib/prisma';
import { apiError, collection, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { OperationsPaginationSchema } from '@/lib/validation/public';

// GET /api/panel/contact-messages?q=&page=&pageSize=
//
// Closes another audit gap: the public Contact form has always saved to
// `ContactMessage`, but nothing in the panel could ever read them back —
// every message sent was effectively going nowhere. Read-only: no
// workflow/status field exists on this model (unlike
// MembershipApplication), so there's nothing to "approve" — this is just a
// list.
export async function GET(req: Request) {
  const auth = await requirePanelAction('contact:view');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = OperationsPaginationSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid filters.', parsed.error.flatten());

  const { page, pageSize, q } = parsed.data;
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { subject: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  try {
    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ]);
    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}
