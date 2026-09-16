import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/passwords";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { hashRefreshToken } from "@/lib/auth/refresh-tokens";
import { randomUUID } from "node:crypto";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid email or password format" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { committee: true, post: true },
  });

  // Same generic error for "no such user" and "wrong password" — don't leak
  // which one it was.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  if (user.status !== "ACTIVE") {
    return Response.json({ error: "This account has been revoked" }, { status: 403 });
  }

  if (user.committee && user.committee.status === "DISSOLVED") {
    return Response.json(
      { error: "Your committee has been dissolved and no longer has access" },
      { status: 403 }
    );
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    postId: user.postId,
    committeeId: user.committeeId,
  });
  const refreshToken = await signRefreshToken({ sub: user.id, jti: randomUUID() });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  setAuthCookies(accessToken, refreshToken);

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      post: user.post?.name ?? null,
    },
  });
}
