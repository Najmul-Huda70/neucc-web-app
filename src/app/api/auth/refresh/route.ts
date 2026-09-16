import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { signRefreshToken } from "@/lib/auth/jwt";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { hashRefreshToken } from "@/lib/auth/refresh-tokens";
import { randomUUID } from "node:crypto";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    await clearAuthCookies();
    return Response.json({ error: "Session expired, please log in again" }, { status: 401 });
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
  });
  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    await clearAuthCookies();
    return Response.json({ error: "Refresh token revoked or expired" }, { status: 401 });
  }

  // Re-check the DB, not just the token — this is what catches a committee
  // that was dissolved since the refresh token was issued (SRS §5.3).
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { committee: true } });

  if (!user || user.status !== "ACTIVE" || user.committee?.status === "DISSOLVED") {
    await clearAuthCookies();
    return Response.json({ error: "Access revoked" }, { status: 403 });
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    postId: user.postId,
    committeeId: user.committeeId,
  });

  const nextRefreshToken = await signRefreshToken({ sub: user.id, jti: randomUUID() });
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date(), replacedBy: hashRefreshToken(nextRefreshToken) },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(nextRefreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  setAuthCookies(accessToken, nextRefreshToken);
  return Response.json({ ok: true });
}
