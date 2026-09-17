import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

// Middleware runs on the Edge runtime, which can't reach Prisma/Postgres —
// so this only checks that a *valid, unexpired* access token exists and
// redirects/blocks if not. The full check (account revoked? committee
// dissolved?) happens in getCurrentUser() inside each route handler /
// server component, which does hit the database. Both layers matter:
// this one keeps obviously-unauthenticated traffic out cheaply; the other
// enforces the real, current RBAC state per SRS §3 ("enforced in every
// route handler, not just hidden in the UI").
// Temporarily keep only panel API routes protected while the dashboard frontend
// is being developed without backend auth enforcement in the browser preview.
const PROTECTED_PREFIXES = ["/api/panel"];

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (!isProtected) return response;

  const token = req.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  if (!payload) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      response.headers.forEach((value, key) => unauthorized.headers.set(key, value));
      return unauthorized;
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/api/panel/:path*"],
};
