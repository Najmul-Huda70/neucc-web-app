import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PRIVATE_PATH_PREFIX = "/dashboard";
const ADMIN_ONLY_PATHS = ["/dashboard/committees", "/dashboard/users"];

// Helper function to verify JWT
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    // jwtVerify automatic token-er 'exp' (Expiration Time) check kore
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, payload: null };
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // 1. User login page-e jawar chesta korle
  if (pathname === "/login") {
    if (token) {
      const { valid } = await verifyToken(token);
      // Token valid thaklei shudhu dashboard-e pathabe
      if (valid) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // Token expired/invalid hole login page access korte dibe ebong bad token delete korbe
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
    return NextResponse.next();
  }

  // 2. Private routes (/dashboard*) check
  if (pathname.startsWith(PRIVATE_PATH_PREFIX)) {
    // Token na thakle login page-e callback URL soho redirect
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Verify JWT Token & Expiration
    const { valid, payload } = await verifyToken(token);

    if (!valid || !payload) {
      // Token Expired / Invalid / Malformed hole cookie clear kore Login page-e pathabe
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      
      const response = NextResponse.redirect(loginUrl);
      // Browser theke expired cookie remove kora hoche
      response.cookies.delete("token"); 
      return response;
    }

    // 4. Role-Based Access Control (Admin-only routes)
    const userRole = payload.role as string; // 'ADMIN' | 'MODERATOR' | 'MEMBER'
    const isAdminRoute = ADMIN_ONLY_PATHS.some((path) =>
      pathname.startsWith(path)
    );

    if (isAdminRoute && userRole !== "ADMIN") {
      // User Access na thakle unauthorized access/dashboard-e redirect
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};