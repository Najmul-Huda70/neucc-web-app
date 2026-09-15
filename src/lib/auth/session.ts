import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import type { Role, UserStatus, CommitteeStatus } from "@prisma/client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  electionAccessGranted: boolean;
  post: { id: string; name: string } | null;
  committee: { id: string; status: CommitteeStatus } | null;
}

/**
 * Resolves the logged-in user from the access-token cookie AND re-checks the
 * database on every call — this is what enforces SRS §5.3's rule that access
 * is revoked the moment a committee is marked Dissolved, not just at login.
 *
 * Use this inside Route Handlers / Server Components (Node runtime), not
 * inside middleware.ts (Edge runtime — see middleware.ts for the lightweight
 * token-presence check used there instead).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      electionAccessGranted: true,
      post: { select: { id: true, name: true } },
      committee: { select: { id: true, status: true } },
    },
  });

  if (!user) return null;
  if (user.status !== "ACTIVE") return null; // account explicitly revoked
  if (user.committee && user.committee.status === "DISSOLVED") return null; // §5.3 auto-revocation

  return user;
}

/** Throws-free helper for route handlers that just need a 401 short-circuit. */
export async function requireUser(): Promise<
  { user: CurrentUser; error: null } | { user: null; error: Response }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}
