import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PRIVATE_PATH_PREFIX = "/dashboard";
const ADMIN_ONLY_PATHS = ["/dashboard/committees", "/dashboard/users"];
const MODERATOR_OR_ADMIN_PATHS = ["/dashboard/events"];

// Separate Rate Limit Maps
const generalRateLimitMap = new Map<string, { count: number; lastReset: number }>();
const authRateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Configs
const GENERAL_LIMIT = 30; // General API: 30 requests per 1 min
const GENERAL_WINDOW = 60 * 1000;

const AUTH_LIMIT = 5; // Auth/Login API: Max 5 attempts per 5 mins
const AUTH_WINDOW = 5 * 60 * 1000;

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET 
    );
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

// Flexible Rate Limiter Helper
function checkRateLimit(
  req: NextRequest,
  storageMap: Map<string, { count: number; lastReset: number }>,
  maxLimit: number,
  windowMs: number,
  customErrorMessage: string
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const now = Date.now();
  const userRate = storageMap.get(ip) || { count: 0, lastReset: now };

  if (now - userRate.lastReset > windowMs) {
    userRate.count = 0;
    userRate.lastReset = now;
  }

  userRate.count += 1;
  storageMap.set(ip, userRate);

  if (userRate.count > maxLimit) {
    return NextResponse.json(
      { success: false, message: customErrorMessage },
      { status: 429 }
    );
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. API Route-wise Rate Limiting
  if (pathname.startsWith("/api")) {
    // Specific protection for Login/Auth endpoints (Brute-Force Guard)
    if (pathname.startsWith("/api/auth")) {
      const authLimitError = checkRateLimit(
        req,
        authRateLimitMap,
        AUTH_LIMIT,
        AUTH_WINDOW,
        "Too many login attempts. Please try again after 5 minutes."
      );
      if (authLimitError) return authLimitError;
    } else {
      // General API Limit
      const generalLimitError = checkRateLimit(
        req,
        generalRateLimitMap,
        GENERAL_LIMIT,
        GENERAL_WINDOW,
        "Too many requests. Maximum 30 requests allowed per minute."
      );
      if (generalLimitError) return generalLimitError;
    }

    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // 2. Login Page Check
  if (pathname === "/login") {
    if (token) {
      const { valid } = await verifyToken(token);
      if (valid) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
    return NextResponse.next();
  }

  // 3. Private Routes Check (/dashboard*)
  if (pathname.startsWith(PRIVATE_PATH_PREFIX)) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { valid, payload } = await verifyToken(token);

    if (!valid || !payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }

    // 4. Role-Based Access Control (RBAC)
    const userRole = payload.role as string;

    const isAdminRoute = ADMIN_ONLY_PATHS.some((path) =>
      pathname.startsWith(path)
    );
    if (isAdminRoute && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isModeratorOrAdminRoute = MODERATOR_OR_ADMIN_PATHS.some((path) =>
      pathname.startsWith(path)
    );
    if (
      isModeratorOrAdminRoute &&
      !["ADMIN", "MODERATOR"].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};