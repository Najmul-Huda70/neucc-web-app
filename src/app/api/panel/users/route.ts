import { Prisma, type Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readJsonBody } from '@/lib/http/request';
import { apiError, collection, ok, unexpectedError } from '@/lib/http/api-response';
import { requirePanelAction } from '@/lib/auth/panel-route';
import { hashPassword } from '@/lib/auth/passwords';
import { UserCreateSchema, UserQuerySchema } from '@/lib/validation/public';

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  studentId: true,
  batch: true,
  electionAccessGranted: true,
  post: { select: { id: true, name: true } },
  committee: { select: { id: true, type: true, status: true } },
  createdAt: true,
  updatedAt: true,
} as const; // never select passwordHash back out to the client

// GET /api/panel/users?committeeId=&postId=&role=&status=&q=
export async function GET(req: Request) {
  const auth = await requirePanelAction('user:manage');
  if (auth.response) return auth.response;

  const url = new URL(req.url);
  const parsed = UserQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid user filters.', parsed.error.flatten());

  const { page, pageSize, committeeId, postId, role, status, q } = parsed.data;
  const where: Prisma.UserWhereInput = {
    ...(committeeId ? { committeeId } : {}),
    ...(postId ? { postId } : {}),
    ...(role ? { role } : {}),
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
      prisma.user.findMany({
        where,
        select: SAFE_SELECT,
        orderBy: [{ post: { rank: 'asc' } }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return collection(items, { page, pageSize, total });
  } catch {
    return unexpectedError();
  }
}

// POST /api/panel/users — President creates a new committee-member account.
// `role` is never taken from the request body: it's always derived from the
// target committee's `type`, so a client can't create an EXECUTIVE_COMMITTEE
// account inside an ELECTION committee (or vice versa).
export async function POST(req: Request) {
  const auth = await requirePanelAction('user:manage');
  if (auth.response) return auth.response;

  const body = await readJsonBody(req);
  const parsed = UserCreateSchema.safeParse(body);
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', 'Invalid user payload.', parsed.error.flatten());

  const [post, committee] = await Promise.all([
    prisma.post.findUnique({ where: { id: parsed.data.postId }, select: { id: true } }),
    prisma.committee.findUnique({ where: { id: parsed.data.committeeId }, select: { id: true, type: true, status: true } }),
  ]);
  if (!post) return apiError(404, 'NOT_FOUND', 'Post not found.');
  if (!committee) return apiError(404, 'NOT_FOUND', 'Committee not found.');
  if (committee.status !== 'ACTIVE') {
    return apiError(400, 'COMMITTEE_NOT_ACTIVE', 'Cannot add a member to a dissolved committee.');
  }

  const role: Role = committee.type === 'ELECTION' ? 'ELECTION_COMMITTEE' : 'EXECUTIVE_COMMITTEE';
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          role,
          postId: parsed.data.postId,
          committeeId: parsed.data.committeeId,
          studentId: parsed.data.studentId ?? null,
          batch: parsed.data.batch ?? null,
        },
        select: SAFE_SELECT,
      });
      await tx.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: 'USER_CREATED',
          targetType: 'User',
          targetId: created.id,
          metadata: { role, postId: created.post?.id, committeeId: created.committee?.id },
        },
      });
      return created;
    });

    return ok(user, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return apiError(409, 'EMAIL_TAKEN', 'A user with this email already exists.');
    }
    return unexpectedError();
  }
}
