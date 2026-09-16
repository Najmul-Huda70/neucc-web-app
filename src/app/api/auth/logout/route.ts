import { clearAuthCookies } from "@/lib/auth/cookies";
import { cookies } from "next/headers";
import { REFRESH_COOKIE } from "@/lib/auth/cookies";
import { revokeRefreshToken } from "@/lib/auth/refresh-tokens";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken);
  await clearAuthCookies();
  return Response.json({ ok: true });
}
