import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { setAccessCookie, clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    clearAuthCookies();
    return Response.json({ error: "Session expired, please log in again" }, { status: 401 });
  }

  // Re-check the DB, not just the token — this is what catches a committee
  // that was dissolved since the refresh token was issued (SRS §5.3).
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { committee: true } });

  if (!user || user.status !== "ACTIVE" || user.committee?.status === "DISSOLVED") {
    clearAuthCookies();
    return Response.json({ error: "Access revoked" }, { status: 403 });
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    postId: user.postId,
    committeeId: user.committeeId,
  });

  setAccessCookie(accessToken);
  return Response.json({ ok: true });
}
