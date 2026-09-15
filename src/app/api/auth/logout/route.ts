import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  clearAuthCookies();
  return Response.json({ ok: true });
}
